/**
 * FRÈRE MIXAGE — Jeu de données réalistes pour le Dashboard Administrateur
 * Conçu spécifiquement pour la marque de haute couture masculine à Dakar.
 */

export const INITIAL_DATA = {
  stats: {
    revenue: 1250000,
    revenueGrowth: '+18.4% ce mois',
    ordersCount: 24,
    ordersGrowth: '+6 cette semaine',
    productsCount: 86,
    lowStockCount: 7
  },

  salesHistory: [
    { month: 'Sep', revenue: 680000, orders: 12 },
    { month: 'Oct', revenue: 750000, orders: 14 },
    { month: 'Nov', revenue: 920000, orders: 18 },
    { month: 'Déc', revenue: 1650000, orders: 32 }, // Fêtes de fin d'année
    { month: 'Jan', revenue: 840000, orders: 15 },
    { month: 'Fév', revenue: 910000, orders: 17 },
    { month: 'Mar', revenue: 1420000, orders: 28 }, // Ramadan / Korité
    { month: 'Avr', revenue: 1890000, orders: 36 }, // Korité
    { month: 'Mai', revenue: 980000, orders: 19 },
    { month: 'Juin', revenue: 2150000, orders: 42 }, // Tabaski
    { month: 'Juil', revenue: 1100000, orders: 21 },
    { month: 'Août', revenue: 1250000, orders: 24 }
  ],

  categories: [
    { 
      id: 'cat-traditionnel', 
      name: 'Tenues Traditionnelles', 
      slug: 'traditionnel', 
      count: 28, 
      isActive: true, 
      order: 1,
      description: 'Grands Boubous, Bazin riche Getzner aux broderies géométriques exécutées au fil d’or mat.'
    },
    { 
      id: 'cat-costumes', 
      name: 'Costumes Africains', 
      slug: 'costumes', 
      count: 22, 
      isActive: true, 
      order: 2,
      description: 'Le croisement noble du smoking d’exception et de l’âme vestimentaire africaine.'
    },
    { 
      id: 'cat-modernes', 
      name: 'Tenues Modernes', 
      slug: 'modernes', 
      count: 18, 
      isActive: true, 
      order: 3,
      description: 'Silhouettes épurées, cols mao et lin respirant taillés pour le quotidien raffiné.'
    },
    { 
      id: 'cat-evenementiel', 
      name: 'Collection Événementielle (ex: Magal)', 
      slug: 'evenementiel', 
      count: 14, 
      isActive: true, 
      order: 4,
      description: 'Créations d’apparat dédiées aux grands rassemblements, Magal de Touba, Gamou et Cérémonies.'
    }
  ],

  products: [
    {
      id: 'prod-1',
      code: 'FM-BR-01',
      name: 'Grand Boubou Royal',
      category: 'Grands Boubous',
      categorySlug: 'grands-boubous',
      price: 150000,
      originalPrice: 180000,
      badge: 'Bestseller',
      status: 'published', // 'published', 'draft', 'sold_out'
      fabric: 'Bazin Riche Getzner 100% Coton Supérieur',
      description: 'Grand boubou 3 pièces confectionné dans un Bazin Getzner impérial avec broderies royales au fil d’or mat.',
      images: [
        'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&q=85&w=800',
        'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=85&w=800'
      ],
      stock: { XS: 0, S: 0, M: 4, L: 6, XL: 2, XXL: 0, XXXL: 0 },
      salesCount: 38
    },
    {
      id: 'prod-2',
      code: 'FM-CS-02',
      name: 'Élégance Noire',
      category: 'Costumes africains',
      categorySlug: 'costumes-africains',
      price: 135000,
      originalPrice: null,
      badge: 'Exclusivité',
      status: 'published',
      fabric: 'Laine froide d’Italie & finitions artisanales',
      description: 'Veste structurée moderne mariant coupe smoking et col officier dakarois avec revers en satin ton sur ton.',
      images: [
        'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=85&w=800',
        'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=85&w=800'
      ],
      stock: { XS: 1, S: 2, M: 5, L: 4, XL: 1, XXL: 1, XXXL: 0 },
      salesCount: 29
    },
    {
      id: 'prod-3',
      code: 'FM-HT-03',
      name: 'Héritage Teranga',
      category: 'Grands Boubous',
      categorySlug: 'grands-boubous',
      price: 140000,
      originalPrice: 160000,
      badge: 'Pièce Maîtresse',
      status: 'published',
      fabric: 'Coton peigné d’Égypte & broderie soyeuse',
      description: 'Teinte ivoire éclatante avec broderies géométriques artisanales inspirées de l’architecture coloniale de Saint-Louis.',
      images: [
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=85&w=800'
      ],
      stock: { XS: 0, S: 1, M: 3, L: 5, XL: 4, XXL: 2, XXXL: 1 },
      salesCount: 24
    },
    {
      id: 'prod-4',
      code: 'FM-SM-04',
      name: 'Sahara Minuit',
      category: 'Ensembles',
      categorySlug: 'ensembles',
      price: 85000,
      originalPrice: null,
      badge: 'Tendance',
      status: 'published',
      fabric: 'Lin lourd d’Afrique de l’Ouest',
      description: 'Ensemble 2 pièces épuré bleu nuit avec plastron texturé et boutons recouverts à la main.',
      images: [
        'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=85&w=800'
      ],
      stock: { XS: 0, S: 0, M: 1, L: 1, XL: 0, XXL: 0, XXXL: 0 }, // Stock faible
      salesCount: 19
    },
    {
      id: 'prod-5',
      code: 'FM-SO-05',
      name: 'Sultan d’Or',
      category: 'Grands Boubous',
      categorySlug: 'grands-boubous',
      price: 175000,
      originalPrice: 210000,
      badge: 'Prestige',
      status: 'published',
      fabric: 'Bazin Riche Teinté artisanalement & Fil d’or',
      description: 'Création d’apparat aux reflets mordorés conçue pour les cérémonies de mariage et les grandes réceptions.',
      images: [
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=85&w=800'
      ],
      stock: { XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0, XXXL: 0 }, // Épuisé
      salesCount: 41
    },
    {
      id: 'prod-6',
      code: 'FM-CD-06',
      name: 'Costume Dakar Prestige',
      category: 'Costumes africains',
      categorySlug: 'costumes-africains',
      price: 160000,
      originalPrice: null,
      badge: 'Nouveau',
      status: 'draft',
      fabric: 'Laine & Soie mélangée',
      description: 'Costume croisé contemporain taillé pour les soirées de gala et rendez-vous diplomatiques.',
      images: [
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=85&w=800'
      ],
      stock: { XS: 0, S: 2, M: 3, L: 2, XL: 1, XXL: 0, XXXL: 0 },
      salesCount: 0
    }
  ],

  orders: [
    {
      id: 'FM-00125',
      customer: {
        id: 'cust-1',
        name: 'Ousmane Diop',
        phone: '+221 77 452 89 12',
        email: 'ousmane.diop@gmail.com',
        city: 'Dakar',
        address: 'Almadies, Villa 42, derrière la clinique des Mamelles'
      },
      items: [
        { productId: 'prod-1', name: 'Grand Boubou Royal', size: 'L', quantity: 1, price: 150000 }
      ],
      totalAmount: 150000,
      paymentMethod: 'Wave Sénégal',
      paymentStatus: 'payé',
      date: '2026-08-20 12:45',
      status: 'new', // 'new', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled'
      statusLabel: 'En attente',
      timeline: [
        { stage: 'received', label: 'Commande reçue', date: '20 Août 2026 - 12:45', done: true },
        { stage: 'confirmed', label: 'Confirmée', date: 'En attente', done: false },
        { stage: 'preparing', label: 'En préparation atelier', date: '—', done: false },
        { stage: 'shipped', label: 'En cours de livraison', date: '—', done: false },
        { stage: 'delivered', label: 'Livrée au client', date: '—', done: false }
      ]
    },
    {
      id: 'FM-00124',
      customer: {
        id: 'cust-2',
        name: 'Cheikh Tidiane Sy',
        phone: '+221 78 120 34 56',
        email: 'ct.sy@invest.sn',
        city: 'Dakar',
        address: 'Point E, Rue 3 x Boulevard de l’Est, Immeuble Horizon'
      },
      items: [
        { productId: 'prod-2', name: 'Élégance Noire', size: 'XL', quantity: 1, price: 135000 },
        { productId: 'prod-4', name: 'Sahara Minuit', size: 'L', quantity: 1, price: 85000 }
      ],
      totalAmount: 220000,
      paymentMethod: 'Orange Money',
      paymentStatus: 'payé',
      date: '2026-08-20 10:15',
      status: 'confirmed',
      statusLabel: 'Confirmée',
      timeline: [
        { stage: 'received', label: 'Commande reçue', date: '20 Août 2026 - 10:15', done: true },
        { stage: 'confirmed', label: 'Confirmée', date: '20 Août 2026 - 10:30', done: true },
        { stage: 'preparing', label: 'En préparation atelier', date: 'En cours', done: false },
        { stage: 'shipped', label: 'En cours de livraison', date: '—', done: false },
        { stage: 'delivered', label: 'Livrée au client', date: '—', done: false }
      ]
    },
    {
      id: 'FM-00123',
      customer: {
        id: 'cust-3',
        name: 'Babacar Ndiaye',
        phone: '+221 76 890 11 22',
        email: 'b.ndiaye@sonatel.sn',
        city: 'Dakar',
        address: 'Mermoz Pyrotechnie, Lot 14'
      },
      items: [
        { productId: 'prod-3', name: 'Héritage Teranga', size: 'M', quantity: 1, price: 140000 }
      ],
      totalAmount: 140000,
      paymentMethod: 'Wave Sénégal',
      paymentStatus: 'payé',
      date: '2026-08-19 18:20',
      status: 'preparing',
      statusLabel: 'En préparation',
      timeline: [
        { stage: 'received', label: 'Commande reçue', date: '19 Août 2026 - 18:20', done: true },
        { stage: 'confirmed', label: 'Confirmée', date: '19 Août 2026 - 18:40', done: true },
        { stage: 'preparing', label: 'En préparation atelier', date: '20 Août 2026 - 09:00', done: true },
        { stage: 'shipped', label: 'En cours de livraison', date: 'Prévu 21 Août', done: false },
        { stage: 'delivered', label: 'Livrée au client', date: '—', done: false }
      ]
    },
    {
      id: 'FM-00122',
      customer: {
        id: 'cust-4',
        name: 'Amadou Lamine Sow',
        phone: '+221 77 630 45 90',
        email: 'amadou.sow@senegal-oil.com',
        city: 'Dakar',
        address: 'Plateau, 12 Rue Vincens, Dakar'
      },
      items: [
        { productId: 'prod-5', name: 'Sultan d’Or', size: 'L', quantity: 1, price: 175000 }
      ],
      totalAmount: 175000,
      paymentMethod: 'Paiement à la livraison',
      paymentStatus: 'en attente',
      date: '2026-08-19 14:00',
      status: 'shipped',
      statusLabel: 'Expédiée',
      timeline: [
        { stage: 'received', label: 'Commande reçue', date: '19 Août 2026 - 14:00', done: true },
        { stage: 'confirmed', label: 'Confirmée', date: '19 Août 2026 - 14:15', done: true },
        { stage: 'preparing', label: 'En préparation atelier', date: '19 Août 2026 - 15:30', done: true },
        { stage: 'shipped', label: 'En cours de livraison (Livreur Dakar Express)', date: '20 Août 2026 - 11:00', done: true },
        { stage: 'delivered', label: 'Livrée au client', date: 'Aujourd’hui', done: false }
      ]
    },
    {
      id: 'FM-00121',
      customer: {
        id: 'cust-5',
        name: 'Moussa Kane',
        phone: '+221 70 333 88 99',
        email: 'mkane@cabinet-dakar.sn',
        city: 'Dakar',
        address: 'Fann Résidence, Rue des Ambassades'
      },
      items: [
        { productId: 'prod-1', name: 'Grand Boubou Royal', size: 'XL', quantity: 1, price: 150000 }
      ],
      totalAmount: 150000,
      paymentMethod: 'Wave Sénégal',
      paymentStatus: 'payé',
      date: '2026-08-18 09:30',
      status: 'delivered',
      statusLabel: 'Livrée',
      timeline: [
        { stage: 'received', label: 'Commande reçue', date: '18 Août 2026 - 09:30', done: true },
        { stage: 'confirmed', label: 'Confirmée', date: '18 Août 2026 - 09:45', done: true },
        { stage: 'preparing', label: 'En préparation atelier', date: '18 Août 2026 - 11:00', done: true },
        { stage: 'shipped', label: 'En cours de livraison', date: '19 Août 2026 - 10:00', done: true },
        { stage: 'delivered', label: 'Livrée au client (Reçue avec succès)', date: '19 Août 2026 - 16:30', done: true }
      ]
    }
  ],

  customers: [
    {
      id: 'cust-1',
      name: 'Ousmane Diop',
      phone: '+221 77 452 89 12',
      email: 'ousmane.diop@gmail.com',
      ordersCount: 3,
      totalSpent: 420000,
      lastOrder: '20 Août 2026',
      city: 'Almadies, Dakar',
      status: 'VIP'
    },
    {
      id: 'cust-2',
      name: 'Cheikh Tidiane Sy',
      phone: '+221 78 120 34 56',
      email: 'ct.sy@invest.sn',
      ordersCount: 2,
      totalSpent: 355000,
      lastOrder: '20 Août 2026',
      city: 'Point E, Dakar',
      status: 'Régulier'
    },
    {
      id: 'cust-3',
      name: 'Babacar Ndiaye',
      phone: '+221 76 890 11 22',
      email: 'b.ndiaye@sonatel.sn',
      ordersCount: 1,
      totalSpent: 140000,
      lastOrder: '19 Août 2026',
      city: 'Mermoz, Dakar',
      status: 'Nouveau'
    },
    {
      id: 'cust-4',
      name: 'Amadou Lamine Sow',
      phone: '+221 77 630 45 90',
      email: 'amadou.sow@senegal-oil.com',
      ordersCount: 4,
      totalSpent: 610000,
      lastOrder: '19 Août 2026',
      city: 'Plateau, Dakar',
      status: 'VIP'
    },
    {
      id: 'cust-5',
      name: 'Moussa Kane',
      phone: '+221 70 333 88 99',
      email: 'mkane@cabinet-dakar.sn',
      ordersCount: 2,
      totalSpent: 285000,
      lastOrder: '18 Août 2026',
      city: 'Fann Résidence, Dakar',
      status: 'Régulier'
    }
  ],

  team: [
    {
      id: 'user-1',
      name: 'Mamadou Lamine Ndiaye',
      email: 'owner@freremixage.com',
      role: 'owner',
      roleLabel: 'Propriétaire',
      avatar: './assets/images/ab8459f150d5d7db346654de338434e5.jpg',
      status: 'Actif',
      joinedDate: '15 Janvier 2025'
    },
    {
      id: 'user-2',
      name: 'Awa Fatou Sall',
      email: 'assistant@freremixage.com',
      role: 'assistant',
      roleLabel: 'Assistante Atelier & Commandes',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      status: 'Actif',
      joinedDate: '01 Mars 2025'
    }
  ],

  recentActivity: [
    { type: 'order_new', title: 'Nouvelle commande #FM-00125', detail: 'Ousmane Diop — 150 000 FCFA (Wave)', time: 'Il y a 12 min' },
    { type: 'order_confirmed', title: 'Commande confirmée #FM-00124', detail: 'Cheikh Tidiane Sy — En attente préparation', time: 'Il y a 2h' },
    { type: 'stock_change', title: 'Alerte stock modifié', detail: 'Sahara Minuit : reste 2 pièces au total', time: 'Il y a 3h' },
    { type: 'product_added', title: 'Nouveau produit ajouté', detail: 'Costume Dakar Prestige enregistré en brouillon', time: 'Hier à 17:40' }
  ],

  alerts: [
    { type: 'warning', title: 'Stock faible', message: 'Sahara Minuit n’a plus que 2 pièces disponibles.', link: '#stocks' },
    { type: 'danger', title: 'Produit épuisé', message: 'Sultan d’Or est actuellement en rupture totale de stock.', link: '#stocks' },
    { type: 'info', title: 'Commande en attente', message: 'La commande #FM-00125 attend votre validation.', link: '#orders' }
  ],

  settings: {
    brandName: 'FRÈRE MIXAGE',
    phone: '+221 77 000 00 00',
    whatsapp: '+221 77 000 00 00',
    email: 'contact@freremixage.com',
    address: 'Atelier Frère Mixage, Sacré-Cœur 3',
    city: 'Dakar, Sénégal',
    currency: 'FCFA (XOF)',
    deliveryDakar: '2 500 FCFA',
    deliveryBanlieue: '3 500 FCFA',
    deliveryRegions: '5 000 FCFA',
    leadTimeStandard: '24h à 48h ouvrées',
    storeStatus: 'open',
    bannerMessage: 'Nouvelle collection Korité & Cérémonies disponible en précommande.'
  },

  invoices: [
    {
      id: 'FM-FAC-2026-001',
      type: 'invoice',
      typeLabel: 'Facture',
      customerName: 'Ousmane Diop',
      customerPhone: '+221 77 452 89 12',
      customerEmail: 'ousmane.diop@gmail.com',
      customerAddress: 'Almadies, Villa 42, Dakar',
      issueDate: '2026-08-20',
      dueDate: '2026-08-27',
      status: 'paid', // 'paid', 'pending', 'draft', 'cancelled'
      statusLabel: 'Payée',
      paymentMethod: 'Wave Sénégal',
      items: [
        { description: 'Grand Boubou Royal (Bazin Riche Getzner - Broderies Or)', size: 'L', quantity: 1, unitPrice: 150000, total: 150000 }
      ],
      discount: 0,
      shipping: 2500,
      subtotal: 150000,
      totalAmount: 152500,
      notes: 'Tenue livrée avec sa housse de protection officielle Frère Mixage.'
    },
    {
      id: 'FM-DEV-2026-002',
      type: 'quote',
      typeLabel: 'Devis',
      customerName: 'Amadou Lamine Sow',
      customerPhone: '+221 77 630 45 90',
      customerEmail: 'amadou.sow@senegal-oil.com',
      customerAddress: 'Plateau, 12 Rue Vincens, Dakar',
      issueDate: '2026-08-19',
      dueDate: '2026-09-02',
      status: 'pending',
      statusLabel: 'En attente de validation',
      paymentMethod: 'Virement / Wave',
      items: [
        { description: 'Costume 3 pièces Sur-Mesure Laine Froide & Soie', size: 'Sur-mesure', quantity: 2, unitPrice: 160000, total: 320000 },
        { description: 'Grand Boubou Prestige Bazin Teinté', size: 'XL', quantity: 1, unitPrice: 175000, total: 175000 }
      ],
      discount: 25000,
      shipping: 0,
      subtotal: 495000,
      totalAmount: 470000,
      notes: 'Offre spéciale pack mariage. Acompte de 50% requis avant le début des essayages.'
    },
    {
      id: 'FM-FAC-2026-003',
      type: 'invoice',
      typeLabel: 'Facture',
      customerName: 'Cheikh Tidiane Sy',
      customerPhone: '+221 78 120 34 56',
      customerEmail: 'ct.sy@invest.sn',
      customerAddress: 'Point E, Boulevard de l’Est, Dakar',
      issueDate: '2026-08-18',
      dueDate: '2026-08-25',
      status: 'paid',
      statusLabel: 'Payée',
      paymentMethod: 'Orange Money',
      items: [
        { description: 'Élégance Noire (Smoking contemporain africain)', size: 'XL', quantity: 1, unitPrice: 135000, total: 135000 },
        { description: 'Sahara Minuit (Ensemble lin bleu nuit)', size: 'L', quantity: 1, unitPrice: 85000, total: 85000 }
      ],
      discount: 10000,
      shipping: 2500,
      subtotal: 220000,
      totalAmount: 212500,
      notes: 'Règlement effectué avec succès.'
    }
  ],

  testimonials: [
    {
      id: 'test-1',
      name: 'Cheikh Diop',
      role: 'Dakar, Sénégal • Client vérifié',
      rating: 5,
      quote: 'Une finition incroyable et une tenue qui correspond exactement à ce que je voulais pour mon mariage. Le tissu a un tombé royal.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
      isActive: true
    },
    {
      id: 'test-2',
      name: 'Mamadou Sy',
      role: 'Paris, France • Diaspora',
      rating: 5,
      quote: 'Le boubou Royal est magnifique. La qualité de la broderie et la finesse du fil d’or sont vraiment au rendez-vous. Livraison rapide à Paris.',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
      isActive: true
    },
    {
      id: 'test-3',
      name: 'Abdoulaye Ndiaye',
      role: 'Abidjan, Côte d’Ivoire • Client vérifié',
      rating: 5,
      quote: 'Service sur mesure exceptionnel. J’ai envoyé mes mesures en ligne et le costume tombait parfaitement dès le premier essayage.',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150',
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
    image1: 'https://images.unsplash.com/photo-1598808503746-f34c53b9323e?auto=format&fit=crop&q=80&w=800',
    image2: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=800',
    pillars: [
      { title: 'SAVOIR-FAIRE', desc: 'Des créations réalisées avec une attention chirurgicale et une précision millimétrée par nos maîtres couturiers.' },
      { title: 'QUALITÉ', desc: 'Des matières nobles d’exception (Bazin riche Getzner, lins peignés, soies) et des finitions choisies avec exigence.' },
      { title: 'STYLE', desc: 'Une identité africaine moderne, fière et raffinée qui impose une présence naturelle et magnétique en toute occasion.' },
      { title: 'SUR MESURE', desc: 'Des créations parfaitement adaptées à votre personnalité, à votre morphologie et à la grandeur de vos événements.' }
    ],
    badges: ['Coupe & Assemblage Main', 'Broderie Fil d’Or Noble', 'Teinture Grand Teint Fixe']
  },

  accounting: {
    totalRevenue: 600000,
    monthRevenue: 20000,
    revenueGrowth: '-84.4% vs mois précédent',
    totalExpenses: 378000,
    monthExpenses: 3000,
    netProfit: 222000,
    netMargin: '37.0%',
    unpaidInvoices: 0,
    unpaidCount: 0,
    monthlyEvolution: [
      { month: 'Sep', revenue: 0, expenses: 0, profit: 0 },
      { month: 'Oct', revenue: 0, expenses: 0, profit: 0 },
      { month: 'Nov', revenue: 0, expenses: 0, profit: 0 },
      { month: 'Déc', revenue: 0, expenses: 0, profit: 0 },
      { month: 'Jan', revenue: 0, expenses: 0, profit: 0 },
      { month: 'Fév', revenue: 0, expenses: 0, profit: 0 },
      { month: 'Mar', revenue: 0, expenses: 0, profit: 0 },
      { month: 'Avr', revenue: 0, expenses: 0, profit: 0 },
      { month: 'Mai', revenue: 0, expenses: 0, profit: 0 },
      { month: 'Juin', revenue: 220000, expenses: 0, profit: 220000 },
      { month: 'Juil', revenue: 360000, expenses: 375000, profit: -15000 },
      { month: 'Août', revenue: 20000, expenses: 3000, profit: 17000 }
    ],
    expensesByCategory: [
      { category: 'Équipement & Atelier', amount: 210000, percentage: 55.5, color: '#DC2626' },
      { category: 'Divers & Fournitures', amount: 130000, percentage: 34.4, color: '#6B7280' },
      { category: 'Transport & Logistique', amount: 38000, percentage: 10.1, color: '#D97706' }
    ],
    expensesList: [
      { id: 'exp-1', date: '2026-08-18', category: 'Équipement & Atelier', description: 'Maintenance machine à broder & fils d’or Getzner', amount: 150000, paymentMethod: 'Wave' },
      { id: 'exp-2', date: '2026-08-12', category: 'Équipement & Atelier', description: 'Ciseaux tailleur de précision & aiguilles spéciales Bazin', amount: 60000, paymentMethod: 'Orange Money' },
      { id: 'exp-3', date: '2026-08-08', category: 'Transport & Logistique', description: 'Livraison express commandes diaspora (Paris & Abidjan)', amount: 38000, paymentMethod: 'Espèces' },
      { id: 'exp-4', date: '2026-07-28', category: 'Divers & Fournitures', description: 'Housses de costumes siglées Frère Mixage & cintres bois', amount: 80000, paymentMethod: 'Virement' },
      { id: 'exp-5', date: '2026-07-15', category: 'Divers & Fournitures', description: 'Fournitures mercerie haute couture et boutons ébène', amount: 50000, paymentMethod: 'Wave' }
    ]
  }
};
