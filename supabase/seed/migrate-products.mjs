/**
 * ⚠️ SCRIPT PRÉPARÉ MAIS NON EXÉCUTÉ (Phase 2).
 *
 * Migre les 7 produits actuellement codés en dur dans
 * assets/js/products.js vers les tables Supabase (categories, products,
 * product_variants). Ne touche PAS assets/js/products.js.
 *
 * À lancer manuellement, plus tard, une fois que :
 *   1. le projet Supabase existe et que les migrations SQL ont été
 *      appliquées (voir supabase/README.md) ;
 *   2. SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont renseignées dans
 *      .env (la clé service_role est nécessaire ici car ce script
 *      contourne volontairement les RLS pour écrire les données —
 *      jamais utiliser cette clé côté navigateur).
 *
 * Lancement (Node.js >= 20.6, qui lit .env nativement) :
 *   node --env-file=.env supabase/seed/migrate-products.mjs
 *
 * Notes de mapping importantes :
 *   - Dans products.js, "price" est le prix ACTUEL (parfois déjà remisé)
 *     et "originalPrice" le prix barré plus élevé. Dans le schéma
 *     Supabase, "price" = prix normal et "sale_price" = prix promo. Ce
 *     script inverse donc correctement les deux champs quand
 *     originalPrice est présent.
 *   - Les images ne sont PAS migrées : ce sont des photos Unsplash
 *     génériques, pas de vraies photos de tenues Frère Mixage. Les
 *     vraies photos seront uploadées via le dashboard admin (Phase 6).
 *   - Les commandes stockées en localStorage par les visiteurs ne sont
 *     ni migrables ni pertinentes (données de démo par navigateur) —
 *     elles ne sont pas traitées ici.
 */

import { createClient } from '@supabase/supabase-js';
import { PRODUCTS, CATEGORIES } from '../../assets/js/products.js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    'Variables manquantes : SUPABASE_URL (ou VITE_SUPABASE_URL) et SUPABASE_SERVICE_ROLE_KEY sont requises.'
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function migrateCategories() {
  const categoryRows = CATEGORIES
    .filter((cat) => cat.id !== 'all')
    .map((cat, index) => ({
      name: cat.label,
      slug: cat.id,
      display_order: index,
      is_active: true
    }));

  const { data, error } = await supabase
    .from('categories')
    .upsert(categoryRows, { onConflict: 'slug' })
    .select('id, slug');

  if (error) throw new Error(`Échec migration catégories : ${error.message}`);

  const slugToId = new Map(data.map((row) => [row.slug, row.id]));
  console.log(`✓ ${data.length} catégories migrées.`);
  return slugToId;
}

async function migrateProducts(categorySlugToId) {
  for (const product of PRODUCTS) {
    // Mapping price/sale_price : voir note en tête de fichier.
    const hasDiscount = Boolean(product.originalPrice);
    const price = hasDiscount ? product.originalPrice : product.price;
    const salePrice = hasDiscount ? product.price : null;

    const { data: productRow, error: productError } = await supabase
      .from('products')
      .upsert(
        {
          name: product.name,
          slug: product.id,
          description: product.description,
          category_id: categorySlugToId.get(product.category) ?? null,
          price,
          sale_price: salePrice,
          fabric: product.fabric,
          lead_time: product.leadTime,
          details: product.details,
          status: 'published',
          is_featured: Boolean(product.featured)
        },
        { onConflict: 'slug' }
      )
      .select('id, slug')
      .single();

    if (productError) {
      console.error(`✗ Produit "${product.id}" : ${productError.message}`);
      continue;
    }

    // Tailles / stock — une ligne product_variants par taille connue,
    // y compris les tailles à 0 (épuisées) pour rester fidèle à la donnée
    // source.
    const variantRows = Object.entries(product.stock).map(([size, stock]) => ({
      product_id: productRow.id,
      size,
      stock
    }));

    const { error: variantsError } = await supabase
      .from('product_variants')
      .upsert(variantRows, { onConflict: 'product_id,size' });

    if (variantsError) {
      console.error(`✗ Tailles du produit "${product.id}" : ${variantsError.message}`);
      continue;
    }

    console.log(`✓ Produit "${product.id}" migré avec ${variantRows.length} taille(s).`);
  }
}

async function main() {
  console.log('Migration des produits Frère Mixage vers Supabase…\n');
  const categorySlugToId = await migrateCategories();
  await migrateProducts(categorySlugToId);
  console.log('\nTerminé. Pensez à uploader les vraies photos de chaque tenue depuis le futur dashboard admin (Phase 6).');
}

main().catch((err) => {
  console.error('Erreur fatale :', err);
  process.exit(1);
});
