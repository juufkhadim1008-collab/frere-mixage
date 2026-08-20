-- =====================================================================
-- Frère Mixage — Supabase Storage (Phase 2)
--
-- Bucket "product-images" : lecture publique (photos catalogue visibles
-- par tous), écriture réservée au staff (owner + assistant actifs).
--
-- Convention de rangement des fichiers (appliquée par le code applicatif
-- en Phase 6, non imposée en dur par une contrainte SQL) :
--   products/{product_id}/{ordre}-{nom-fichier}.webp
-- =====================================================================

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "public_read_product_images_bucket" on storage.objects
  for select using (bucket_id = 'product-images');

create policy "staff_upload_product_images_bucket" on storage.objects
  for insert with check (bucket_id = 'product-images' and public.is_staff());

create policy "staff_update_product_images_bucket" on storage.objects
  for update using (bucket_id = 'product-images' and public.is_staff())
  with check (bucket_id = 'product-images' and public.is_staff());

create policy "staff_delete_product_images_bucket" on storage.objects
  for delete using (bucket_id = 'product-images' and public.is_staff());
