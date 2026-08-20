-- =====================================================================
-- Frère Mixage — Schéma initial (Phase 2)
-- Extensions, types énumérés, tables, index, triggers, fonctions utilitaires
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Types énumérés
-- ---------------------------------------------------------------------
create type public.user_role as enum ('owner', 'assistant');
create type public.product_status as enum ('draft', 'published', 'sold_out');
create type public.order_status as enum ('new', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled');

-- ---------------------------------------------------------------------
-- profiles — un profil par utilisateur admin (owner ou assistant),
-- lié 1:1 à auth.users
-- ---------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role user_role not null default 'assistant',
  full_name text not null,
  email text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Comptes administrateurs (propriétaire et assistants) liés à auth.users.';

-- ---------------------------------------------------------------------
-- categories
-- ---------------------------------------------------------------------
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- products
-- ---------------------------------------------------------------------
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  category_id uuid references public.categories (id) on delete set null,
  price numeric(12, 2) not null check (price >= 0),
  sale_price numeric(12, 2) check (sale_price is null or (sale_price >= 0 and sale_price <= price)),
  fabric text,
  -- Champs additionnels absents de la spécification d'origine mais présents dans
  -- le catalogue actuel (assets/js/products.js : "leadTime", "details"). Conservés
  -- ici pour permettre une migration des 7 produits existants sans perte de données.
  -- Signalés dans le rapport de phase — à retirer si non souhaités.
  lead_time text,
  details text[],
  status product_status not null default 'draft',
  is_featured boolean not null default false,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- product_images
-- L'URL publique n'est pas stockée : elle se dérive de storage_path via
-- supabase.storage.from('product-images').getPublicUrl(storage_path)
-- ---------------------------------------------------------------------
create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  storage_path text not null,
  display_order integer not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

-- Une seule image principale par produit
create unique index one_primary_image_per_product
  on public.product_images (product_id)
  where is_primary;

-- ---------------------------------------------------------------------
-- product_variants — tailles + stock par taille
-- ---------------------------------------------------------------------
create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  size text not null,
  stock integer not null default 0 check (stock >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, size)
);

-- ---------------------------------------------------------------------
-- customers
-- ---------------------------------------------------------------------
create table public.customers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null unique,
  email text,
  city text,
  address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- orders
-- Numéro de commande généré côté serveur (évite les collisions du
-- Math.random() actuellement utilisé côté client dans order-service.js)
-- ---------------------------------------------------------------------
create sequence public.order_number_seq;

create or replace function public.generate_order_number()
returns text
language plpgsql
as $$
declare
  next_val bigint;
begin
  next_val := nextval('public.order_number_seq');
  return 'FM-' || to_char(now(), 'YYYY') || '-' || lpad(next_val::text, 4, '0');
end;
$$;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default public.generate_order_number(),
  customer_id uuid not null references public.customers (id) on delete restrict,
  status order_status not null default 'new',
  subtotal numeric(12, 2) not null check (subtotal >= 0),
  delivery_fee numeric(12, 2) not null default 0 check (delivery_fee >= 0),
  total numeric(12, 2) not null check (total >= 0),
  payment_method text not null check (payment_method in ('wave', 'orange_money', 'card', 'cash_on_delivery')),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'processing', 'paid', 'failed', 'refunded')),
  delivery_option_id text,
  delivery_option_name text,
  delivery_address text not null,
  notes text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- order_items — lignes de commande, avec "snapshot" du produit au
-- moment de l'achat (nom + prix figés, insensibles aux modifs futures)
-- ---------------------------------------------------------------------
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  product_name_snapshot text not null,
  size text not null,
  quantity integer not null check (quantity > 0),
  unit_price numeric(12, 2) not null check (unit_price >= 0),
  total_price numeric(12, 2) not null check (total_price >= 0),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- activity_logs — journal append-only
-- ---------------------------------------------------------------------
create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  description text not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Index
-- ---------------------------------------------------------------------
create index idx_products_category_id on public.products (category_id);
create index idx_products_status on public.products (status);
create index idx_product_images_product_id on public.product_images (product_id);
create index idx_product_variants_product_id on public.product_variants (product_id);
create index idx_orders_customer_id on public.orders (customer_id);
create index idx_orders_status on public.orders (status);
create index idx_orders_created_at on public.orders (created_at desc);
create index idx_order_items_order_id on public.order_items (order_id);
create index idx_order_items_product_id on public.order_items (product_id);
create index idx_activity_logs_user_id on public.activity_logs (user_id);
create index idx_activity_logs_created_at on public.activity_logs (created_at desc);

-- ---------------------------------------------------------------------
-- Trigger générique updated_at
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger trg_categories_updated_at before update on public.categories for each row execute function public.set_updated_at();
create trigger trg_products_updated_at before update on public.products for each row execute function public.set_updated_at();
create trigger trg_product_variants_updated_at before update on public.product_variants for each row execute function public.set_updated_at();
create trigger trg_customers_updated_at before update on public.customers for each row execute function public.set_updated_at();
create trigger trg_orders_updated_at before update on public.orders for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- Provisionnement automatique d'un profil à la création d'un compte auth.
-- Rôle par défaut : 'assistant' (le tout premier compte "owner" doit être
-- promu manuellement en SQL — voir supabase/README.md, Phase 4).
-- ---------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, full_name, email)
  values (new.id, 'assistant', coalesce(new.raw_user_meta_data ->> 'full_name', new.email), new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
