-- ============================================================
-- BabyStore — Migration Script (v1 → v2)
-- Exécuter sur une base existante pour appliquer les corrections
-- de sécurité et de performance SANS perdre les données.
-- ============================================================

-- ─── 1. SÉCURITÉ : Corriger le trigger d'inscription ────────────────────────
-- AVANT : le rôle venait de raw_user_meta_data (injectable par l'utilisateur)
-- APRÈS : le rôle est toujours 'customer'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $fn1$
BEGIN
    INSERT INTO public.profiles (id, name, role)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'name', ''),
        'customer'  -- sécurisé : toujours customer
    );
    RETURN new;
END;
$fn1$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── 2. Uniformiser les rôles : 'user' → 'customer' ─────────────────────────
-- Si le schema-clean.sql a été utilisé, certains profils ont role='user'
UPDATE public.profiles SET role = 'customer' WHERE role = 'user';

-- Mettre à jour la contrainte CHECK si elle existe avec 'user'
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check
    CHECK (role IN ('customer', 'admin'));

-- ─── 3. SÉCURITÉ : Corriger les politiques RLS des commandes ────────────────
DROP POLICY IF EXISTS "Anyone can view orders"       ON public.orders;
DROP POLICY IF EXISTS "Users can view own orders"    ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders"   ON public.orders;

CREATE POLICY "Users can view own orders"
    ON public.orders FOR SELECT
    USING (
        auth.uid() = user_id
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Corriger l'INSERT : auth.uid() = user_id (pas juste IS NOT NULL)
DROP POLICY IF EXISTS "Authenticated users can create orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create orders"              ON public.orders;

CREATE POLICY "Authenticated users can create orders"
    ON public.orders FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Corriger l'UPDATE : user + admin
DROP POLICY IF EXISTS "Admin can update orders"          ON public.orders;
DROP POLICY IF EXISTS "Users or admin can update orders" ON public.orders;

CREATE POLICY "Users or admin can update orders"
    ON public.orders FOR UPDATE
    USING (
        auth.uid() = user_id
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- ─── 4. Ajouter les colonnes manquantes à orders ────────────────────────────
DO $do1$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='payment_status') THEN
        ALTER TABLE public.orders ADD COLUMN payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='pix_transaction_id') THEN
        ALTER TABLE public.orders ADD COLUMN pix_transaction_id TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='paid_at') THEN
        ALTER TABLE public.orders ADD COLUMN paid_at TIMESTAMPTZ;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='updated_at') THEN
        ALTER TABLE public.orders ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $do1$;

-- Créer la fonction update_updated_at si elle n'existe pas encore
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $fn2$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$fn2$ LANGUAGE plpgsql;

-- Ajouter le trigger updated_at sur orders s'il manque
DROP TRIGGER IF EXISTS set_updated_at ON public.orders;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ─── 5. Ajouter les CHECK constraints sur products ──────────────────────────
-- (ALTER TABLE ADD CONSTRAINT IF NOT EXISTS n'existe pas en PG, on drop+add)
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_price_check;
ALTER TABLE public.products ADD CONSTRAINT products_price_check CHECK (price >= 0);

ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_stock_check;
ALTER TABLE public.products ADD CONSTRAINT products_stock_check CHECK (count_in_stock >= 0);

ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_rating_check;
ALTER TABLE public.products ADD CONSTRAINT products_rating_check CHECK (rating >= 0 AND rating <= 5);

-- ─── 6. Contrainte unique sur reviews (si la table existe) ──────────────────
DO $do2$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='reviews') THEN
        ALTER TABLE public.reviews DROP CONSTRAINT IF EXISTS unique_user_product_review;
        ALTER TABLE public.reviews ADD CONSTRAINT unique_user_product_review UNIQUE (user_id, product_id);
        CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.reviews(product_id);
        CREATE INDEX IF NOT EXISTS idx_reviews_user_id    ON public.reviews(user_id);
    END IF;
END $do2$;

-- ─── 7. INDEXES de performance ──────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_products_category_id  ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_created_at   ON public.products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_user_id        ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at     ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_role         ON public.profiles(role);

-- ─── 8. Restreindre l'accès à admin_overview ────────────────────────────────
REVOKE ALL ON public.admin_overview FROM anon;
GRANT SELECT ON public.admin_overview TO authenticated;

-- ─── 9. Politiques Storage pour product-images ──────────────────────────────
-- Bucket public pour la lecture
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Supprimer les politiques existantes pour éviter les conflits
DROP POLICY IF EXISTS "Public read product images"      ON storage.objects;
DROP POLICY IF EXISTS "Admin can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete product images" ON storage.objects;

CREATE POLICY "Public read product images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'product-images');

CREATE POLICY "Admin can upload product images"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'product-images'
        AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Admin can update product images"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'product-images'
        AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Admin can delete product images"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'product-images'
        AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- ─── DONE ───────────────────────────────────────────────────────────────────
-- Vérification : exécuter les requêtes suivantes pour valider :
--   SELECT * FROM public.admin_overview;
--   SELECT column_name FROM information_schema.columns WHERE table_name = 'orders';
--   SELECT conname FROM pg_constraint WHERE conrelid = 'public.reviews'::regclass;