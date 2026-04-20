-- ============================================================
-- BabyStore — Clean Schema (v2 — reset complet)
-- ⚠ DÉTRUIT toutes les données existantes
-- À exécuter UNE SEULE FOIS pour repartir propre
-- ============================================================

-- Nettoyage complet (ordre important : FK d'abord)
DROP TABLE IF EXISTS public.reviews   CASCADE;
DROP TABLE IF EXISTS public.orders    CASCADE;
DROP TABLE IF EXISTS public.products  CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.profiles  CASCADE;
DROP VIEW  IF EXISTS public.admin_overview;

-- Suppression des fonctions et triggers existants
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at() CASCADE;

-- Politiques Storage (bucket product-images)
DROP POLICY IF EXISTS "Public read product images"      ON storage.objects;
DROP POLICY IF EXISTS "Admin can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete product images" ON storage.objects;

-- ============================================================
-- 1. PROFILES
-- ============================================================
CREATE TABLE public.profiles (
    id          UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name        TEXT        NOT NULL DEFAULT '',
    role        TEXT        NOT NULL DEFAULT 'customer'
                            CHECK (role IN ('customer', 'admin')),
    avatar      TEXT        DEFAULT NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone"
    ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable insert for service role"
    ON public.profiles FOR INSERT WITH CHECK (true);

-- SÉCURITÉ : le rôle est toujours 'customer' à l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, name, role)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'name', ''),
        'customer'
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 2. CATEGORIES
-- ============================================================
CREATE TABLE public.categories (
    id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        TEXT        NOT NULL,
    slug        TEXT        NOT NULL UNIQUE,
    image       TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are viewable by everyone"
    ON public.categories FOR SELECT USING (true);

CREATE POLICY "Admin can insert categories"
    ON public.categories FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Admin can update categories"
    ON public.categories FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Admin can delete categories"
    ON public.categories FOR DELETE USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- ============================================================
-- 3. PRODUCTS
-- ============================================================
CREATE TABLE public.products (
    id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            TEXT            NOT NULL,
    description     TEXT            NOT NULL DEFAULT '',
    translations    JSONB           DEFAULT '{}',
    price           NUMERIC(10,2)   NOT NULL DEFAULT 0 CHECK (price >= 0),
    category_id     UUID            REFERENCES public.categories(id) ON DELETE SET NULL,
    images          TEXT[]          DEFAULT '{}',
    count_in_stock  INTEGER         NOT NULL DEFAULT 0 CHECK (count_in_stock >= 0),
    rating          NUMERIC(3,1)    NOT NULL DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    num_reviews     INTEGER         NOT NULL DEFAULT 0 CHECK (num_reviews >= 0),
    created_at      TIMESTAMPTZ     DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     DEFAULT NOW()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products are viewable by everyone"
    ON public.products FOR SELECT USING (true);

CREATE POLICY "Admin can insert products"
    ON public.products FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Admin can update products"
    ON public.products FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Admin can delete products"
    ON public.products FOR DELETE USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- ============================================================
-- 4. ORDERS
-- ============================================================
CREATE TABLE public.orders (
    id                  UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID            REFERENCES auth.users(id) ON DELETE SET NULL,
    order_items         JSONB           NOT NULL DEFAULT '[]',
    shipping_address    JSONB           NOT NULL DEFAULT '{}',
    payment_method      TEXT            NOT NULL DEFAULT 'PIX'
                                        CHECK (payment_method IN ('PIX', 'PayPal', 'Card')),
    payment_status      TEXT            NOT NULL DEFAULT 'pending'
                                        CHECK (payment_status IN ('pending', 'paid', 'failed')),
    pix_transaction_id  TEXT,
    total_price         NUMERIC(10,2)   NOT NULL DEFAULT 0 CHECK (total_price >= 0),
    is_paid             BOOLEAN         NOT NULL DEFAULT FALSE,
    paid_at             TIMESTAMPTZ,
    is_delivered        BOOLEAN         NOT NULL DEFAULT FALSE,
    delivered_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ     DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     DEFAULT NOW()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders"
    ON public.orders FOR SELECT USING (
        auth.uid() = user_id
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Authenticated users can create orders"
    ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users or admin can update orders"
    ON public.orders FOR UPDATE USING (
        auth.uid() = user_id
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- ============================================================
-- 5. REVIEWS
-- ============================================================
CREATE TABLE public.reviews (
    id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID        REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id  UUID        REFERENCES public.products(id) ON DELETE CASCADE,
    rating      INTEGER     NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment     TEXT        NOT NULL DEFAULT '',
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_product_review UNIQUE (user_id, product_id)
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are viewable by everyone"
    ON public.reviews FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create reviews"
    ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
    ON public.reviews FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users or admin can delete reviews"
    ON public.reviews FOR DELETE USING (
        auth.uid() = user_id
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- ============================================================
-- 6. TRIGGER updated_at (toutes les tables)
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.categories
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- 7. INDEXES
-- ============================================================
CREATE INDEX idx_products_category_id  ON public.products(category_id);
CREATE INDEX idx_products_created_at   ON public.products(created_at DESC);
CREATE INDEX idx_orders_user_id        ON public.orders(user_id);
CREATE INDEX idx_orders_created_at     ON public.orders(created_at DESC);
CREATE INDEX idx_reviews_product_id    ON public.reviews(product_id);
CREATE INDEX idx_reviews_user_id       ON public.reviews(user_id);
CREATE INDEX idx_profiles_role         ON public.profiles(role);

-- ============================================================
-- 8. VUE admin_overview (accès authentifiés uniquement)
-- ============================================================
CREATE OR REPLACE VIEW public.admin_overview AS
SELECT
    (SELECT COUNT(*) FROM public.profiles)                                          AS total_users,
    (SELECT COUNT(*) FROM public.products)                                          AS total_products,
    (SELECT COUNT(*) FROM public.orders)                                            AS total_orders,
    (SELECT COALESCE(SUM(total_price), 0) FROM public.orders WHERE is_paid = TRUE) AS total_sales;

REVOKE ALL ON public.admin_overview FROM anon;
GRANT SELECT ON public.admin_overview TO authenticated;

-- ============================================================
-- 9. STORAGE : politiques bucket product-images
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

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