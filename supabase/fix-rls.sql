-- ============================================================
-- Fix RLS for orders - users can only see their own orders, admins can see all
-- ============================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view orders" ON public.orders;

-- Create restrictive policies
-- Users can see their own orders
CREATE POLICY "Users can view own orders"
    ON public.orders FOR SELECT
    USING (user_id = auth.uid());

-- Admins can see all orders
CREATE POLICY "Admins can view all orders"
    ON public.orders FOR SELECT
    USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Authenticated users can create orders
DROP POLICY IF EXISTS "Authenticated users can create orders" ON public.orders;
CREATE POLICY "Users can create orders"
    ON public.orders FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);