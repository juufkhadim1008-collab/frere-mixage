/**
 * Catalogue des pièces de haute couture FRÈRE MIXAGE
 * Synchronisation dynamique avec le Dashboard Administrateur (localStorage)
 */

const DEFAULT_PRODUCTS = [
  {
    id: 'boubou-royal',
    name: 'Boubou Royal',
    category: 'traditionnel',
    categoryLabel: 'Tenue Traditionnelle',
    price: 150000,
    originalPrice: 180000,
    badge: 'Bestseller',
    featured: true,
    leadTime: 'Disponible sous 24-48h',
    description: 'Une réinterprétation magistrale du grand boubou traditionnel sénégalais. Confectionné dans un Bazin riche Getzner aux reflets profonds, sublimé par des broderies géométriques exécutées avec un fil d’or mat d’une délicatesse absolue.',
    fabric: 'Bazin Riche Getzner 100% Coton Supérieur',
    details: [
      'Broderie artisanale ton-sur-ton avec légers rehauts dorés',
      'Col officier rigide et fente d’encolure raffinée',
      'Manches amples pour une gestuelle royale et un port impeccable',
      'Pantalon assorti coupe droite moderne avec cordon d’ajustement et poches italiennes'
    ],
    images: [
      'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&q=85&w=1200',
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=85&w=1200'
    ],
    availableSizes: ['M', 'L', 'XL', 'XXL'],
    stock: { 'S': 0, 'M': 4, 'L': 6, 'XL': 3, 'XXL': 2 }
  },
  {
    id: 'elegance-noire',
    name: 'Élégance Noire',
    category: 'costumes',
    categoryLabel: 'Costume Africain',
    price: 135000,
    originalPrice: null,
    badge: 'Exclusivité',
    featured: true,
    leadTime: 'Disponible immédiatement',
    description: 'Le croisement parfait entre la rigueur du smoking contemporain et l’âme du vestiaire africain. Veste structurée à simple boutonnage avec revers en satin noir texturé et finitions faites main à l’atelier Frère Mixage.',
    fabric: 'Laine froide d’Italie & doublure en soie respirante',
    details: [
      'Coupe slim-tailored ajustée qui valorise la carrure',
      'Boutons recouverts à la main façon tailleur traditionnel',
      'Fentes d’aisance latérales pour un confort optimal',
      'Pantalon cigarette à plis marqués et ceinture ajustée'
    ],
    images: [
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=85&w=1200',
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=85&w=1200'
    ],
    availableSizes: ['S', 'M', 'L', 'XL'],
    stock: { 'S': 2, 'M': 5, 'L': 4, 'XL': 1, 'XXL': 0 }
  },
  {
    id: 'heritage',
    name: 'Héritage Teranga',
    category: 'traditionnel',
    categoryLabel: 'Tenue Traditionnelle',
    price: 140000,
    originalPrice: 160000,
    badge: 'Pièce Maîtresse',
    featured: true,
    leadTime: 'Disponible sous 24h',
    description: 'Un hommage vibrant à l’héritage vestimentaire sénégalais. Teinte ivoire éclatante avec broderies centrales inspirées des motifs architecturaux de Saint-Louis et de l’île de Gorée.',
    fabric: 'Coton peigné d’Égypte & fil de soie noble',
    details: [
      'Étoffe lourde au tombé somptueux et infroissable',
      'Broderies denses au point de chaînette exécutées par nos maîtres artisans',
      'Encolure renforcée pour une tenue impeccable au fil des années'
    ],
    images: [
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=85&w=1200'
    ],
    availableSizes: ['M', 'L', 'XL', 'XXL'],
    stock: { 'S': 0, 'M': 3, 'L': 5, 'XL': 4, 'XXL': 2 }
  },
  {
    id: 'sahara-minuit',
    name: 'Sahara Minuit',
    category: 'modernes',
    categoryLabel: 'Tenue Moderne',
    price: 85000,
    originalPrice: null,
    badge: 'Tendance',
    featured: false,
    leadTime: 'Disponible sous 24-48h',
    description: 'L’ensemble deux pièces indispensable pour l’homme d’affaires ou les sorties raffinées. Veste courte à col mao et pantalon fuselé confectionnés dans un lin lourd d’Afrique de l’Ouest.',
    fabric: '100% Lin brut d’Afrique de l’Ouest',
    details: [
      'Tissu thermorégulateur idéal pour le climat tropical',
      'Poches invisibles et coutures rabattues anglaises',
      'Ceinture semi-élastiquée pour une liberté de mouvement totale'
    ],
    images: [
      'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=85&w=1200'
    ],
    availableSizes: ['M', 'L', 'XL'],
    stock: { 'S': 0, 'M': 2, 'L': 3, 'XL': 1, 'XXL': 0 }
  },
  {
    id: 'sultan-dor',
    name: 'Sultan d’Or (Collection Magal)',
    category: 'evenementiel',
    categoryLabel: 'Collection Événementielle',
    price: 175000,
    originalPrice: 210000,
    badge: 'Prestige',
    featured: true,
    leadTime: 'Confection d’apparat (3 jours)',
    description: 'Une création somptueuse aux reflets dorés chauds. Réservée aux grandes occasions, mariages prestigieux et cérémonies diplomatiques.',
    fabric: 'Bazin Riche Teinté artisanalement & Fil d’or véritable',
    details: [
      'Bazin martelé à la main pour une brillance incomparable',
      'Broderies complexes au plastron et aux poignets',
      'Coupe ample traditionnelle'
    ],
    images: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=85&w=1200'
    ],
    availableSizes: ['L', 'XL', 'XXL'],
    stock: { 'S': 0, 'M': 0, 'L': 2, 'XL': 1, 'XXL': 1 }
  },
  {
    id: 'sur-mesure-haute-couture',
    name: 'Signature Sur Mesure',
    category: 'traditionnel',
    categoryLabel: 'Création sur mesure',
    price: 95000,
    originalPrice: null,
    badge: 'Haute Couture',
    featured: true,
    leadTime: 'Confection personnalisée (5-7 jours)',
    description: 'Une pièce unique créée exclusivement pour vous selon vos mensurations exactes. Choix des étoffes, sélection personnalisée des broderies, coupe adaptée à votre morphologie.',
    fabric: 'Étoffe au choix (Bazin riche Getzner, Laine vierge, Soie sauvage)',
    details: [
      'Prise de mesures détaillée (en atelier ou guidée à distance)',
      'Patronnage individuel sur-mesure découpé à la main',
      'Accompagnement personnalisé par le maître couturier'
    ],
    images: [
      'https://images.unsplash.com/photo-1598808503746-f34c53b9323e?auto=format&fit=crop&q=85&w=1200'
    ],
    availableSizes: ['Sur Mesure', 'S', 'M', 'L', 'XL', 'XXL'],
    stock: { 'Sur Mesure': 99, 'S': 99, 'M': 99, 'L': 99, 'XL': 99, 'XXL': 99 }
  }
];

let memoryProducts = null;

/**
 * Charge les produits en temps réel depuis Supabase (Cloud) ou le cache local
 */
export function getActiveProducts() {
  if (memoryProducts && memoryProducts.length > 0) {
    return memoryProducts;
  }

  try {
    const saved = localStorage.getItem('frere_mixage_admin_state_v3') || 
                  localStorage.getItem('frere_mixage_admin_state_v2') || 
                  localStorage.getItem('frere_mixage_admin_state_v1');
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
            images: p.images && p.images.length > 0 ? p.images : ['https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&q=85&w=1200'],
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
    const { ProductService } = await import('./services/product-service.js');
    const remote = await ProductService.getPublishedProducts();
    if (remote && remote.length > 0) {
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
