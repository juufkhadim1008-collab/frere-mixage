/**
 * Catalogue des pièces de haute couture FRÈRE MIXAGE
 * Structure de données optimisée et facilement extensible.
 */
export const PRODUCTS = [
  {
    id: 'boubou-royal',
    name: 'Boubou Royal',
    category: 'boubous',
    categoryLabel: 'Boubou traditionnel',
    price: 15000,
    originalPrice: 50000,
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
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=85&w=1200',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=85&w=1200'
    ],
    // Seules ces tailles sont réellement disponibles en stock
    availableSizes: ['M', 'L', 'XL', 'XXL'],
    stock: {
      'S': 0, // Épuisé (non sélectionnable)
      'M': 4,
      'L': 6,
      'XL': 3,
      'XXL': 2
    }
  },
  {
    id: 'elegance-noire',
    name: 'Élégance Noire',
    category: 'costumes',
    categoryLabel: 'Costume africain',
    price: 55000,
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
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=85&w=1200',
      'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&q=85&w=1200'
    ],
    availableSizes: ['S', 'M', 'L', 'XL'],
    stock: {
      'S': 2,
      'M': 5,
      'L': 4,
      'XL': 1,
      'XXL': 0 // Épuisé
    }
  },
  {
    id: 'heritage',
    name: 'Héritage Teranga',
    category: 'boubous',
    categoryLabel: 'Boubou traditionnel',
    price: 50000,
    originalPrice: 55000,
    badge: 'Pièce Maîtresse',
    featured: true,
    leadTime: 'Disponible sous 24h',
    description: 'Un hommage vibrant à l’héritage vestimentaire sénégalais. Teinte ivoire éclatante avec broderies centrales inspirées des motifs architecturaux de Saint-Louis et de l’île de Gorée.',
    fabric: 'Coton peigné d’Égypte & fil de soie noble',
    details: [
      'Étoffe lourde au tombé somptueux et infroissable',
      'Broderies denses au point de chaînette exécutées par nos maîtres artisans',
      'Encolure renforcée pour une tenue impeccable au fil des années',
      'Livré avec sa housse de protection haute couture siglée'
    ],
    images: [
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=85&w=1200',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=85&w=1200',
      'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&q=85&w=1200'
    ],
    availableSizes: ['M', 'L', 'XL', 'XXL'],
    stock: {
      'S': 0,
      'M': 3,
      'L': 5,
      'XL': 4,
      'XXL': 2
    }
  },
  {
    id: 'sahel-minimaliste',
    name: 'Sahélien Minimal',
    category: 'modernes',
    categoryLabel: 'Tenue moderne',
    price: 42000,
    originalPrice: null,
    badge: 'Nouveauté',
    featured: false,
    leadTime: 'Disponible sous 24h',
    description: 'Une silhouette contemporaine pensée pour le quotidien de l’homme d’affaires moderne. Tunique épurée col mao avec boutonnière cachée et pantalon fuselé en lin de première qualité.',
    fabric: 'Lin lavé premium & sergé de coton respirant',
    details: [
      'Confort thermique exceptionnel adapté aux climats tropicaux',
      'Lignes droites minimalistes sans surcharge visuelle',
      'Finitions d’emmanchures surpiquées au millimètre',
      'Poches latérales discrètes et poche poitrine passepoilée'
    ],
    images: [
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=85&w=1200',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=85&w=1200',
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&q=85&w=1200'
    ],
    availableSizes: ['S', 'M', 'L', 'XL'],
    stock: {
      'S': 3,
      'M': 6,
      'L': 4,
      'XL': 2,
      'XXL': 0
    }
  },
  {
    id: 'costume-imperiale-dakar',
    name: 'Impérial Dakar',
    category: 'costumes',
    categoryLabel: 'Costume africain',
    price: 65000,
    originalPrice: 70000,
    badge: 'Cérémonie',
    featured: false,
    leadTime: 'Disponible sous 48h',
    description: 'Une création audacieuse conçue pour les galas, mariages et moments solennels. Veste croisée 6 boutons avec revers châle rehaussé d’un galon artisanal noir et doré.',
    fabric: 'Cachemire léger & jacquard de soie structuré',
    details: [
      'Épaulettes anglaises travaillées pour une stature dominante',
      'Doublure intérieure ornée du sceau monogramme Frère Mixage',
      'Double fente d’aisance au dos',
      'Boutons métalliques gravés en or vieilli'
    ],
    images: [
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=85&w=1200',
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=85&w=1200',
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=85&w=1200'
    ],
    availableSizes: ['M', 'L', 'XL'],
    stock: {
      'S': 0,
      'M': 2,
      'L': 3,
      'XL': 2,
      'XXL': 0
    }
  },
  {
    id: 'boubou-senateur-or',
    name: 'Sénateur Or Mat',
    category: 'boubous',
    categoryLabel: 'Boubou traditionnel',
    price: 48000,
    originalPrice: null,
    badge: 'Raffinement',
    featured: false,
    leadTime: 'Disponible sous 24h',
    description: 'Le classicisme sénégalais poussé à son paroxysme. Une coupe sénateur 3 pièces avec chasuble brodée, chemise intérieure à col officier et pantalon parfaitement taillé.',
    fabric: 'Super Bazin 100% Coton Lustré',
    details: [
      'Teinture artisanale fixe grand teint éclat longue durée',
      'Plastron brodé avec motifs géométriques mandingues stylisés',
      'Aisance totale et respirabilité du tissu',
      'Finitions intérieures gansées au biais de coton'
    ],
    images: [
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&q=85&w=1200',
      'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&q=85&w=1200',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=85&w=1200'
    ],
    availableSizes: ['L', 'XL', 'XXL'],
    stock: {
      'S': 0,
      'M': 0,
      'L': 4,
      'XL': 5,
      'XXL': 3
    }
  },
  {
    id: 'sur-mesure-haute-couture',
    name: 'Signature Sur Mesure',
    category: 'sur-mesure',
    categoryLabel: 'Création sur mesure',
    price: 95000,
    originalPrice: null,
    badge: 'Haute Couture',
    featured: true,
    leadTime: 'Confection personnalisée (5-7 jours)',
    description: 'Une pièce unique créée exclusivement pour vous selon vos mensurations exactes. Choix des étoffes, sélection personnalisée des broderies, coupe adaptée à votre morphologie et rendez-vous d’essayage ou télé-consultation privée.',
    fabric: 'Étoffe au choix (Bazin riche Getzner, Laine vierge, Soie sauvage)',
    details: [
      'Prise de mesures détaillée (en atelier ou guidée à distance)',
      'Patronnage individuel sur-mesure découpé à la main',
      'Broderies ou boutons monogrammés à vos initiales',
      'Accompagnement personnalisé par le maître couturier Frère Mixage'
    ],
    images: [
      'https://images.unsplash.com/photo-1598808503746-f34c53b9323e?auto=format&fit=crop&q=85&w=1200',
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=85&w=1200',
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=85&w=1200'
    ],
    availableSizes: ['Sur Mesure', 'S', 'M', 'L', 'XL', 'XXL'],
    stock: {
      'Sur Mesure': 99,
      'S': 99,
      'M': 99,
      'L': 99,
      'XL': 99,
      'XXL': 99
    }
  }
];

export const CATEGORIES = [
  { id: 'all', label: 'Toutes les créations', count: PRODUCTS.length },
  { id: 'costumes', label: 'Costumes africains', count: PRODUCTS.filter(p => p.category === 'costumes').length },
  { id: 'boubous', label: 'Boubous traditionnels', count: PRODUCTS.filter(p => p.category === 'boubous').length },
  { id: 'modernes', label: 'Tenues modernes', count: PRODUCTS.filter(p => p.category === 'modernes').length },
  { id: 'sur-mesure', label: 'Créations sur mesure', count: PRODUCTS.filter(p => p.category === 'sur-mesure').length }
];

/**
 * Récupère un produit par son identifiant unique
 */
export function getProductById(id) {
  return PRODUCTS.find(p => p.id === id) || null;
}

/**
 * Filtre les produits par catégorie
 */
export function getProductsByCategory(categoryId) {
  if (!categoryId || categoryId === 'all') return PRODUCTS;
  return PRODUCTS.filter(p => p.category === categoryId);
}

/**
 * Formatage des prix en FCFA
 */
export function formatPrice(amount) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    maximumFractionDigits: 0
  }).format(amount) + ' FCFA';
}
