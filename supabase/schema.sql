-- ============================================================
-- BabyStore — Supabase Schema
-- Execute this SQL in the Supabase SQL editor
-- ============================================================

-- 0. Enable necessary extensions
create extension if not exists "uuid-ossp";

-- ============================================================
-- 1. PROFILES (linked to Supabase Auth)
-- ============================================================
create table if not exists public.profiles (
    id uuid references auth.users on delete cascade primary key,
    name text not null default '',
    role text not null default 'customer' check (role in ('customer', 'admin')),
    avatar text default 'https://via.placeholder.com/150',
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

-- Anyone can read profiles
create policy "Profiles are viewable by everyone"
    on public.profiles for select using (true);

-- Users can update their own profile
create policy "Users can update own profile"
    on public.profiles for update using (auth.uid() = id);

-- Allow insert from the trigger (service role)
create policy "Enable insert for service role"
    on public.profiles for insert with check (true);

-- Auto-create profile on signup via trigger
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.profiles (id, name, role)
    values (
        new.id,
        coalesce(new.raw_user_meta_data->>'name', ''),
        coalesce(new.raw_user_meta_data->>'role', 'customer')
    );
    return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();

-- ============================================================
-- 2. CATEGORIES
-- ============================================================
create table if not exists public.categories (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    slug text not null unique,
    image text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

alter table public.categories enable row level security;

create policy "Categories are viewable by everyone"
    on public.categories for select using (true);

-- Admin-only write: check profile role
create policy "Admin can insert categories"
    on public.categories for insert with check (
        exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
    );

create policy "Admin can update categories"
    on public.categories for update using (
        exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
    );

create policy "Admin can delete categories"
    on public.categories for delete using (
        exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
    );

-- ============================================================
-- 3. PRODUCTS
-- ============================================================
create table if not exists public.products (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    description text not null default '',
    translations jsonb default '{}',
    price numeric(10,2) not null default 0,
    category_id uuid references public.categories(id) on delete set null,
    images text[] default '{}',
    count_in_stock integer not null default 0,
    rating numeric(3,1) not null default 0,
    num_reviews integer not null default 0,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

alter table public.products enable row level security;

create policy "Products are viewable by everyone"
    on public.products for select using (true);

create policy "Admin can insert products"
    on public.products for insert with check (
        exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
    );

create policy "Admin can update products"
    on public.products for update using (
        exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
    );

create policy "Admin can delete products"
    on public.products for delete using (
        exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
    );

-- ============================================================
-- 4. ORDERS
-- ============================================================
create table if not exists public.orders (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) on delete set null,
    order_items jsonb not null default '[]',
    shipping_address jsonb not null default '{}',
    payment_method text not null default 'PIX' check (payment_method in ('PIX', 'PayPal', 'Card')),
    payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'failed')),
    pix_transaction_id text,
    total_price numeric(10,2) not null default 0,
    is_paid boolean not null default false,
    paid_at timestamptz,
    is_delivered boolean not null default false,
    delivered_at timestamptz,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

alter table public.orders enable row level security;

-- Users can see their own orders
create policy "Users can view own orders"
    on public.orders for select using (
        auth.uid() = user_id
        or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
    );

-- Authenticated users can create orders
create policy "Authenticated users can create orders"
    on public.orders for insert with check (auth.uid() = user_id);

-- Users can update own orders (for payment), admin can update any
create policy "Users or admin can update orders"
    on public.orders for update using (
        auth.uid() = user_id
        or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
    );

-- ============================================================
-- 5. REVIEWS
-- ============================================================
create table if not exists public.reviews (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) on delete cascade,
    product_id uuid references public.products(id) on delete cascade,
    rating integer not null check (rating >= 1 and rating <= 5),
    comment text not null default '',
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

alter table public.reviews enable row level security;

create policy "Reviews are viewable by everyone"
    on public.reviews for select using (true);

create policy "Authenticated users can create reviews"
    on public.reviews for insert with check (auth.uid() = user_id);

create policy "Users can update own reviews"
    on public.reviews for update using (auth.uid() = user_id);

create policy "Users can delete own reviews"
    on public.reviews for delete using (
        auth.uid() = user_id
        or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
    );

-- ============================================================
-- 6. HELPER: updated_at auto-update trigger
-- ============================================================
create or replace function public.update_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger set_updated_at before update on public.profiles
    for each row execute function public.update_updated_at();

create trigger set_updated_at before update on public.categories
    for each row execute function public.update_updated_at();

create trigger set_updated_at before update on public.products
    for each row execute function public.update_updated_at();

create trigger set_updated_at before update on public.orders
    for each row execute function public.update_updated_at();

create trigger set_updated_at before update on public.reviews
    for each row execute function public.update_updated_at();

-- ============================================================
-- 7. VIEWS: admin overview (for dashboard)
-- ============================================================
create or replace view public.admin_overview as
select
    (select count(*) from public.profiles) as total_users,
    (select count(*) from public.products) as total_products,
    (select count(*) from public.orders) as total_orders,
    (select coalesce(sum(total_price), 0) from public.orders where is_paid = true) as total_sales;

-- ============================================================
-- 8. STORAGE: product-images bucket
-- ============================================================
-- Run this via Supabase dashboard or:
-- insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true);
