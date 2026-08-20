-- =====================================================================
-- Frère Mixage — Row Level Security (Phase 2)
--
-- Principe général :
--   - Visiteurs publics (rôle anon) : lecture seule des produits PUBLIÉS
--     (et de leurs images/tailles), rien d'autre.
--   - staff (owner + assistant actifs) : accès large en lecture/écriture
--     sur la boutique (produits, images, tailles, catégories en lecture).
--   - owner uniquement : suppression, gestion des catégories, gestion
--     des comptes/permissions.
--   - customers / orders / order_items : AUCUN accès public en écriture.
--     La création de commande depuis le site public sera implémentée en
--     Phase 9 via une fonction RPC "security definer" dédiée (contrôle
--     serveur du stock et des totaux), pas par un accès direct aux
--     tables. Tant que cette fonction n'existe pas, le flux de commande
--     public actuel (localStorage) n'est donc affecté par aucune de ces
--     policies.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Fonctions utilitaires (security definer pour éviter la récursion RLS
-- lorsqu'une policy sur "profiles" a besoin de lire "profiles")
-- ---------------------------------------------------------------------
create or replace function public.is_owner()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and is_active = true and role = 'owner'
  );
$$;

create or replace function public.is_staff()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and is_active = true and role in ('owner', 'assistant')
  );
$$;

-- ---------------------------------------------------------------------
-- Activation RLS sur toutes les tables métier
-- ---------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_variants enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.activity_logs enable row level security;

-- ---------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------
create policy "owner_full_access_profiles" on public.profiles
  for all using (public.is_owner()) with check (public.is_owner());

create policy "self_select_profile" on public.profiles
  for select using (id = auth.uid());

-- ---------------------------------------------------------------------
-- categories — lecture publique des catégories actives, gestion owner
-- ---------------------------------------------------------------------
create policy "public_read_active_categories" on public.categories
  for select using (is_active = true);

create policy "staff_read_all_categories" on public.categories
  for select using (public.is_staff());

create policy "owner_insert_categories" on public.categories
  for insert with check (public.is_owner());

create policy "owner_update_categories" on public.categories
  for update using (public.is_owner()) with check (public.is_owner());

create policy "owner_delete_categories" on public.categories
  for delete using (public.is_owner());

-- ---------------------------------------------------------------------
-- products — lecture publique des produits publiés uniquement
-- ---------------------------------------------------------------------
create policy "public_read_published_products" on public.products
  for select using (status = 'published');

create policy "staff_read_all_products" on public.products
  for select using (public.is_staff());

create policy "staff_insert_products" on public.products
  for insert with check (public.is_staff());

create policy "staff_update_products" on public.products
  for update using (public.is_staff()) with check (public.is_staff());

create policy "owner_delete_products" on public.products
  for delete using (public.is_owner());

-- ---------------------------------------------------------------------
-- product_images
-- ---------------------------------------------------------------------
create policy "public_read_published_product_images" on public.product_images
  for select using (
    exists (select 1 from public.products p where p.id = product_id and p.status = 'published')
  );

create policy "staff_read_all_product_images" on public.product_images
  for select using (public.is_staff());

create policy "staff_insert_product_images" on public.product_images
  for insert with check (public.is_staff());

create policy "staff_update_product_images" on public.product_images
  for update using (public.is_staff()) with check (public.is_staff());

create policy "staff_delete_product_images" on public.product_images
  for delete using (public.is_staff());

-- ---------------------------------------------------------------------
-- product_variants (tailles / stock)
-- ---------------------------------------------------------------------
create policy "public_read_published_product_variants" on public.product_variants
  for select using (
    exists (select 1 from public.products p where p.id = product_id and p.status = 'published')
  );

create policy "staff_read_all_product_variants" on public.product_variants
  for select using (public.is_staff());

create policy "staff_insert_product_variants" on public.product_variants
  for insert with check (public.is_staff());

create policy "staff_update_product_variants" on public.product_variants
  for update using (public.is_staff()) with check (public.is_staff());

create policy "staff_delete_product_variants" on public.product_variants
  for delete using (public.is_staff());

-- ---------------------------------------------------------------------
-- customers — aucun accès public. Owner : tout. Assistant : lecture seule
-- ("consulter les clients" uniquement, conformément aux permissions définies).
-- ---------------------------------------------------------------------
create policy "owner_full_access_customers" on public.customers
  for all using (public.is_owner()) with check (public.is_owner());

create policy "staff_read_customers" on public.customers
  for select using (public.is_staff());

-- ---------------------------------------------------------------------
-- orders — aucun accès anon. staff : lecture/écriture/mise à jour de
-- statut. Suppression réservée au owner.
-- ---------------------------------------------------------------------
create policy "staff_read_orders" on public.orders
  for select using (public.is_staff());

create policy "staff_insert_orders" on public.orders
  for insert with check (public.is_staff());

create policy "staff_update_orders" on public.orders
  for update using (public.is_staff()) with check (public.is_staff());

create policy "owner_delete_orders" on public.orders
  for delete using (public.is_owner());

-- ---------------------------------------------------------------------
-- order_items
-- ---------------------------------------------------------------------
create policy "staff_read_order_items" on public.order_items
  for select using (public.is_staff());

create policy "staff_insert_order_items" on public.order_items
  for insert with check (public.is_staff());

create policy "staff_update_order_items" on public.order_items
  for update using (public.is_staff()) with check (public.is_staff());

create policy "owner_delete_order_items" on public.order_items
  for delete using (public.is_owner());

-- ---------------------------------------------------------------------
-- activity_logs — lecture pour le staff, écriture append-only (pas de
-- update/delete : le journal ne doit pas pouvoir être réécrit)
-- ---------------------------------------------------------------------
create policy "staff_read_activity_logs" on public.activity_logs
  for select using (public.is_staff());

create policy "staff_insert_activity_logs" on public.activity_logs
  for insert with check (public.is_staff());
