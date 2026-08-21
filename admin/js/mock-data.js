/**
 * FRÈRE MIXAGE — Configuration & Données Initiales Propres pour la Production
 * Initialisé à zéro pour un démarrage réel de l'activité.
 */

export const INITIAL_DATA = {
  stats: {
    revenue: 0,
    revenueGrowth: '0%',
    ordersCount: 0,
    ordersGrowth: '0',
    productsCount: 0,
    lowStockCount: 0
  },

  salesHistory: [
    { month: 'Jan', revenue: 0, orders: 0 },
    { month: 'Fév', revenue: 0, orders: 0 },
    { month: 'Mar', revenue: 0, orders: 0 },
    { month: 'Avr', revenue: 0, orders: 0 },
    { month: 'Mai', revenue: 0, orders: 0 },
    { month: 'Juin', revenue: 0, orders: 0 },
    { month: 'Juil', revenue: 0, orders: 0 },
    { month: 'Août', revenue: 0, orders: 0 },
    { month: 'Sep', revenue: 0, orders: 0 },
    { month: 'Oct', revenue: 0, orders: 0 },
    { month: 'Nov', revenue: 0, orders: 0 },
    { month: 'Déc', revenue: 0, orders: 0 }
  ],

  categories: [
    { 
      id: 'cat-traditionnel', 
      name: 'Tenues Traditionnelles', 
      slug: 'traditionnel', 
      count: 0, 
      isActive: true, 
      order: 1,
      description: 'Grands Boubous, Bazin riche Getzner aux broderies géométriques exécutées au fil d’or mat.'
    },
    { 
      id: 'cat-costumes', 
      name: 'Costumes Africains', 
      slug: 'costumes', 
      count: 0, 
      isActive: true, 
      order: 2,
      description: 'Le croisement noble du smoking d’exception et de l’âme vestimentaire africaine.'
    },
    { 
      id: 'cat-modernes', 
      name: 'Tenues Modernes', 
      slug: 'modernes', 
      count: 0, 
      isActive: true, 
      order: 3,
      description: 'Silhouettes épurées, cols mao et lin respirant taillés pour le quotidien raffiné.'
    },
    { 
      id: 'cat-evenementiel', 
      name: 'Collection Événementielle (ex: Magal)', 
      slug: 'evenementiel', 
      count: 0, 
      isActive: true, 
      order: 4,
      description: 'Créations d’apparat dédiées aux grands rassemblements, Magal de Touba, Gamou et Cérémonies.'
    }
  ],

  products: [],
  orders: [],
  customers: [],
  measurements: [],
  invoices: [],
  recentActivity: [],
  alerts: [],

  team: [
    {
      id: 'user-1',
      name: 'Maison Frère Mixage',
      email: 'contact@freremixage.com',
      role: 'owner',
      roleLabel: 'Propriétaire',
      avatar: '/assets/images/ab8459f150d5d7db346654de338434e5.jpg',
      status: 'Actif',
      joinedDate: 'Janvier 2026'
    }
  ],

  settings: {
    brandName: 'FRÈRE MIXAGE',
    phone: '+221 78 634 76 66',
    whatsapp: '+221 78 634 76 66',
    email: 'contact@freremixage.com',
    address: 'Atelier Frère Mixage, Sacré-Cœur 3',
    city: 'Dakar, Sénégal',
    currency: 'FCFA (XOF)',
    deliveryDakar: '2 500 FCFA',
    deliveryBanlieue: '3 500 FCFA',
    deliveryRegions: '5 000 FCFA',
    leadTimeStandard: '24h à 48h ouvrées',
    storeStatus: 'open',
    bannerMessage: 'Bienvenue chez Frère Mixage — Maison de Haute Couture Masculine à Dakar.'
  },

  testimonials: [
    {
      id: 'test-1',
      name: 'Cheikh Diop',
      role: 'Dakar, Sénégal • Client vérifié',
      rating: 5,
      quote: 'Une finition incroyable et une tenue qui correspond exactement à ce que je voulais pour mon mariage. Le tissu a un tombé royal.',
      avatar: '/assets/images/ab8459f150d5d7db346654de338434e5.jpg',
      isActive: true
    },
    {
      id: 'test-2',
      name: 'Mamadou Sy',
      role: 'Paris, France • Diaspora',
      rating: 5,
      quote: 'Le boubou Royal est magnifique. La qualité de la broderie et la finesse du fil d’or sont vraiment au rendez-vous. Livraison rapide à Paris.',
      avatar: '/assets/images/hero-frere-mixage.jpg',
      isActive: true
    },
    {
      id: 'test-3',
      name: 'Abdoulaye Ndiaye',
      role: 'Abidjan, Côte d’Ivoire • Client vérifié',
      rating: 5,
      quote: 'Service sur mesure exceptionnel. J’ai envoyé mes mesures en ligne et le costume tombait parfaitement dès le premier essayage.',
      avatar: '/assets/images/ab8459f150d5d7db346654de338434e5.jpg',
      isActive: true
    }
  ],

  about: {
    sectionTitle: 'POURQUOI FRÈRE MIXAGE ?',
    sectionSubtitle: 'L’alliance de la tradition tailleur sénégalaise et des standards de la haute couture internationale.',
    quote: '« Plus qu’une tenue, une signature. »',
    quoteAuthor: '— Maison Frère Mixage',
    storyParagraph1: 'Dans notre atelier de Dakar, chaque vêtement naît d’un dialogue intime entre tradition ancestrale et silhouette contemporaine. Nos artisans découpent, assemblent et brodent à la main chaque pièce avec une rigueur absolue.',
    storyParagraph2: 'Du drapé majestueux du Bazin teinté artisanalement à la précision géométrique de nos boutonnières, rien n’est laissé au hasard. Porter Frère Mixage, c’est affirmer un statut, une fierté et un raffinement sans compromis.',
    image1: '/assets/images/ab8459f150d5d7db346654de338434e5.jpg',
    image2: '/assets/images/hero-frere-mixage.jpg',
    pillars: [
      { title: 'SAVOIR-FAIRE', desc: 'Des créations réalisées avec une attention chirurgicale et une précision millimétrée par nos maîtres couturiers.' },
      { title: 'QUALITÉ', desc: 'Des matières nobles d’exception (Bazin riche Getzner, lins peignés, soies) et des finitions choisies avec exigence.' },
      { title: 'STYLE', desc: 'Une identité africaine moderne, fière et raffinée qui impose une présence naturelle et magnétique en toute occasion.' },
      { title: 'SUR MESURE', desc: 'Des créations parfaitement adaptées à votre personnalité, à votre morphologie et à la grandeur de vos événements.' }
    ],
    badges: ['Coupe & Assemblage Main', 'Broderie Fil d’Or Noble', 'Teinture Grand Teint Fixe']
  },

  accounting: {
    totalRevenue: 0,
    monthRevenue: 0,
    revenueGrowth: '0%',
    totalExpenses: 0,
    monthExpenses: 0,
    netProfit: 0,
    netMargin: '0%',
    unpaidInvoices: 0,
    unpaidCount: 0,
    monthlyEvolution: [
      { month: 'Jan', revenue: 0, expenses: 0, profit: 0 },
      { month: 'Fév', revenue: 0, expenses: 0, profit: 0 },
      { month: 'Mar', revenue: 0, expenses: 0, profit: 0 },
      { month: 'Avr', revenue: 0, expenses: 0, profit: 0 },
      { month: 'Mai', revenue: 0, expenses: 0, profit: 0 },
      { month: 'Juin', revenue: 0, expenses: 0, profit: 0 },
      { month: 'Juil', revenue: 0, expenses: 0, profit: 0 },
      { month: 'Août', revenue: 0, expenses: 0, profit: 0 },
      { month: 'Sep', revenue: 0, expenses: 0, profit: 0 },
      { month: 'Oct', revenue: 0, expenses: 0, profit: 0 },
      { month: 'Nov', revenue: 0, expenses: 0, profit: 0 },
      { month: 'Déc', revenue: 0, expenses: 0, profit: 0 }
    ],
    categories: [
      { id: 'cat-equip', name: 'Équipement & Atelier', color: '#C6A868', total: 0, count: 0 },
      { id: 'cat-fabrics', name: 'Tissus & Bazin', color: '#DFBF7D', total: 0, count: 0 },
      { id: 'cat-logistics', name: 'Transport & Logistique', color: '#9E988D', total: 0, count: 0 },
      { id: 'cat-misc', name: 'Divers & Fournitures', color: '#6A655B', total: 0, count: 0 }
    ],
    expenses: []
  }
};
