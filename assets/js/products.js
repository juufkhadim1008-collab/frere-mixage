/**
 * Catalogue des pièces de haute couture FRÈRE MIXAGE
 * Synchronisation dynamique avec Supabase Cloud (Source unique de vérité)
 */

import { ProductService } from './services/product-service.js';

const DEFAULT_PRODUCTS = [];

let memoryProducts = null;
let isFetchingLive = false;

export function isProductsLoaded() {
  return memoryProducts !== null;
}

export function invalidateProductsCache() {
  memoryProducts = null;
}

// Synchronisation instantanée temps réel inter-onglets (Dashboard <-> Vitrine)
try {
  const channel = new BroadcastChannel('frere_mixage_sync');
  channel.onmessage = (event) => {
    if (event.data?.type === 'STATE_UPDATED') {
      memoryProducts = null;
      window.dispatchEvent(new CustomEvent('supabase-products-synced', { detail: getActiveProducts() }));
    }
  };
} catch (e) {}

window.addEventListener('storage', (e) => {
  if (!e.key || e.key === 'frere_mixage_admin_state_v6') {
    memoryProducts = null;
    window.dispatchEvent(new CustomEvent('supabase-products-synced', { detail: getActiveProducts() }));
  }
});

/**
 * Charge les produits en temps réel depuis Supabase (Cloud) ou le cache local validé
 */
export function getActiveProducts() {
  if (memoryProducts && Array.isArray(memoryProducts)) {
    return memoryProducts;
  }

  try {
    const saved = localStorage.getItem('frere_mixage_admin_state_v6');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.products && Array.isArray(parsed.products) && parsed.products.length > 0) {
        // Filtrer strictement : seuls les produits sans images fictives et avec id valide
        const validProds = parsed.products
          .filter(p => p.status !== 'draft' && p.name)
          .filter(p => !p.images || !p.images[0] || (!p.images[0].includes('unsplash') && !p.images[0].includes('1617137984095')))
          .map(p => {
            const availableSizes = [];
            if (p.stock) {
              Object.keys(p.stock).forEach(sz => {
                if (p.stock[sz] > 0) availableSizes.push(sz);
              });
            }
            if (availableSizes.length === 0) availableSizes.push('M', 'L', 'XL');

            let cat = 'traditionnel';
            const catStr = (p.categorySlug || p.category || '').toLowerCase();
            if (catStr.includes('costume')) cat = 'costumes';
            else if (catStr.includes('ensemble') || catStr.includes('moderne') || catStr.includes('chemise') || catStr.includes('pantalon')) cat = 'modernes';
            else if (catStr.includes('evenement') || catStr.includes('magal') || catStr.includes('gamou') || catStr.includes('korite') || catStr.includes('fete')) cat = 'evenementiel';
            else if (catStr.includes('tradition') || catStr.includes('boubou')) cat = 'traditionnel';

            return {
              id: p.id || p.code || p.slug,
              dbId: p.dbId || p.id || null,
              name: p.name,
              category: cat,
              categoryLabel: p.category || 'Haute Couture',
              price: p.price,
              originalPrice: p.originalPrice || null,
              badge: p.badge || (p.originalPrice ? 'Promotion' : ''),
              featured: Boolean(p.featured || p.is_featured),
              leadTime: p.leadTime || 'Disponible sous 24-48h',
              description: p.description || 'Création d’exception taillée sur mesure.',
              fabric: p.fabric || 'Bazin Riche / Laine d’Italie',
              details: [
                'Finitions haute couture soignées à l’atelier de Dakar',
                'Broderies de précision faites main',
                'Coupe élégante et confortable'
              ],
              images: (p.images && p.images.length > 0) ? p.images : ['/assets/images/hero-frere-mixage.jpg'],
              availableSizes: availableSizes,
              stock: p.stock || { 'M': 5, 'L': 5, 'XL': 5 }
            };
          });

        if (validProds.length > 0) {
          memoryProducts = validProds;
          return memoryProducts;
        }
      }
    }
  } catch (e) {
    console.warn('Erreur lecture dynamic products:', e);
  }

  return DEFAULT_PRODUCTS;
}

/**
 * Récupère les produits en direct depuis Supabase et met à jour la mémoire
 */
export async function fetchLiveProductsFromSupabase() {
  if (isFetchingLive) return memoryProducts || [];
  isFetchingLive = true;

  try {
    const remote = await ProductService.getPublishedProducts();
    if (Array.isArray(remote)) {
      memoryProducts = remote;
      window.dispatchEvent(new CustomEvent('supabase-products-synced', { detail: remote }));
      return remote;
    }
  } catch (err) {
    console.warn('[Products] Connexion Supabase :', err.message);
  } finally {
    isFetchingLive = false;
  }

  return getActiveProducts();
}

export const PRODUCTS = getActiveProducts();

export function getActiveCategories() {
  const currentProds = getActiveProducts();
  return [
    { id: 'all', label: 'Toutes les créations', count: currentProds.length },
    { id: 'traditionnel', label: 'Tenues Traditionnelles', count: currentProds.filter(p => p.category === 'traditionnel').length },
    { id: 'costumes', label: 'Costumes Africains', count: currentProds.filter(p => p.category === 'costumes').length },
    { id: 'modernes', label: 'Tenues Modernes', count: currentProds.filter(p => p.category === 'modernes').length },
    { id: 'evenementiel', label: 'Collection Événementielle', count: currentProds.filter(p => p.category === 'evenementiel').length }
  ];
}

export const CATEGORIES = getActiveCategories();

export function getProductById(id) {
  const prods = getActiveProducts();
  return prods.find(p => p.id === id) || DEFAULT_PRODUCTS.find(p => p.id === id) || null;
}

export function getProductsByCategory(categoryId) {
  const prods = getActiveProducts();
  if (!categoryId || categoryId === 'all') return prods;
  return prods.filter(p => p.category === categoryId);
}

export function formatPrice(amount) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    maximumFractionDigits: 0
  }).format(amount) + ' FCFA';
}
