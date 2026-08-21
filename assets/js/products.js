/**
 * Catalogue des pièces de haute couture FRÈRE MIXAGE
 * Synchronisation dynamique avec le Dashboard Administrateur (localStorage)
 */

import { ProductService } from './services/product-service.js';

const DEFAULT_PRODUCTS = [];

let memoryProducts = null;

/**
 * Charge les produits en temps réel depuis Supabase (Cloud) ou le cache local
 */
export function getActiveProducts() {
  if (memoryProducts && memoryProducts.length > 0) {
    return memoryProducts;
  }

  try {
    const saved = localStorage.getItem('frere_mixage_admin_state_v5') ||
                  localStorage.getItem('frere_mixage_admin_state_v4') ||
                  localStorage.getItem('frere_mixage_admin_state_v3');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.products && parsed.products.length > 0) {
        return parsed.products.filter(p => p.status !== 'draft').map(p => {
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

          const validImages = (p.images && p.images.length > 0 && !p.images[0].includes('unsplash') && !p.images[0].includes('1617137984095')) 
            ? p.images 
            : ['./assets/images/hero-frere-mixage.jpg'];

          return {
            id: p.id || p.code,
            dbId: p.dbId || null,
            name: p.name,
            category: cat,
            categoryLabel: p.category || 'Haute Couture',
            price: p.price,
            originalPrice: p.originalPrice || null,
            badge: p.badge || (p.originalPrice ? 'Promotion' : ''),
            featured: true,
            leadTime: 'Disponible sous 24-48h',
            description: p.description || 'Création d’exception taillée sur mesure.',
            fabric: p.fabric || 'Bazin Riche / Laine d’Italie',
            details: [
              'Finitions haute couture soignées à l’atelier de Dakar',
              'Broderies de précision',
              'Coupe élégante et confortable'
            ],
            images: validImages,
            availableSizes: availableSizes,
            stock: p.stock || { 'M': 5, 'L': 5, 'XL': 5 }
          };
        });
      }
    }
  } catch (e) {
    console.warn('Erreur lecture dynamic products:', e);
  }
  return DEFAULT_PRODUCTS;
}

/**
 * Récupère les produits en direct depuis Supabase et déclenche la mise à jour
 */
export async function fetchLiveProductsFromSupabase() {
  try {
    const remote = await ProductService.getPublishedProducts();
    if (Array.isArray(remote)) {
      memoryProducts = remote;
      window.dispatchEvent(new CustomEvent('supabase-products-synced', { detail: remote }));
      return remote;
    }
  } catch (err) {
    console.warn('[Products] Connexion Supabase en cours :', err.message);
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
