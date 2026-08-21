/**
 * Configuration globale de l'application FRÈRE MIXAGE
 * Modifiez facilement ces valeurs pour personnaliser la boutique.
 */
export const CONFIG = {
  brandName: 'FRÈRE MIXAGE',
  tagline: "L'élégance africaine, taillée pour vous.",

  // Numéro WhatsApp officiel de Frère Mixage (Format international sans espace ni +)
  whatsappNumber: '221786347666',

  // Devise & formatage
  currency: 'FCFA',
  currencySymbol: 'FCFA',
  locale: 'fr-FR',

  // Options de livraison au Sénégal et International
  deliveryOptions: [
    { id: 'dakar-express', name: 'Dakar & Banlieue (Livraison Express 24h)', price: 2000, freeAbove: 100000 },
    { id: 'thies-mbour', name: 'Thiès, Mbour & Petite Côte (48h)', price: 3500, freeAbove: 150000 },
    { id: 'regions-senegal', name: 'Autres Régions du Sénégal (72h)', price: 5000, freeAbove: 200000 },
    { id: 'international', name: 'International / Diaspora (DHL Express 3-5 jours)', price: 25000, freeAbove: null }
  ],

  // Moyens de paiement configurés
  paymentGateways: {
    wave: {
      name: 'Wave Sénégal',
      tagline: 'Paiement instantané sans frais via votre app Wave',
      icon: 'wave',
      badge: 'Recommandé ⚡',
      color: '#1dc4ff',
      isLive: false // Mettre à true lors de la connexion de l'API Wave Checkout
    },
    orangeMoney: {
      name: 'Orange Money',
      tagline: 'Paiement sécurisé avec validation par code OTP (#144#)',
      icon: 'orange-money',
      badge: 'Populaire',
      color: '#ff7900',
      isLive: false // Mettre à true lors de la connexion de l'API Orange Money
    },
    card: {
      name: 'Carte Bancaire (Visa / Mastercard)',
      tagline: 'Paiement sécurisé 3D Secure pour le Sénégal et l’international',
      icon: 'card',
      badge: 'International',
      color: '#c5a059',
      isLive: false
    },
    cashOnDelivery: {
      name: 'Paiement à la livraison',
      tagline: 'Payez en espèces ou Wave à la réception (Dakar uniquement)',
      icon: 'hand-coins',
      badge: 'Dakar',
      color: '#4ade80',
      isLive: true
    }
  },

  // Points d'API backend (à connecter à votre serveur Node/Express/Laravel/Firebase)
  api: {
    createOrderUrl: '/api/v1/orders/create',
    initiatePaymentUrl: '/api/v1/payments/initiate',
    verifyPaymentUrl: '/api/v1/payments/verify',
    whatsappNotificationWebhook: '/api/v1/notifications/whatsapp'
  },

  // Guide des tailles officielles Frère Mixage (en cm)
  sizeChart: [
    { size: 'S', chest: '92-96', waist: '78-82', shoulder: '44', height: '168-175' },
    { size: 'M', chest: '98-102', waist: '84-88', shoulder: '46', height: '172-180' },
    { size: 'L', chest: '104-108', waist: '90-94', shoulder: '48', height: '176-185' },
    { size: 'XL', chest: '110-116', waist: '96-102', shoulder: '50', height: '180-190' },
    { size: 'XXL', chest: '118-124', waist: '104-110', shoulder: '52', height: '182-195' },
    { size: 'Sur Mesure', chest: 'Personnalisé', waist: 'Personnalisé', shoulder: 'Personnalisé', height: 'Sur rdv ou saisie' }
  ]
};
