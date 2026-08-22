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

  // Moyens de paiement officiels configurés
  paymentGateways: {
    wave: {
      name: 'Wave Sénégal',
      tagline: 'Paiement instantané sans frais via votre application Wave',
      icon: 'wave',
      badge: 'Recommandé ⚡',
      color: '#1dc4ff',
      accountNumber: '+221 78 241 49 49',
      accountClean: '221782414949',
      accountName: 'MAISON FRÈRE MIXAGE',
      isLive: true
    },
    orangeMoney: {
      name: 'Orange Money Sénégal',
      tagline: 'Paiement direct sécurisé via Orange Money Sénégal',
      icon: 'orange-money',
      badge: 'Orange Money 🟠',
      color: '#ff7900',
      accountNumber: '+221 78 634 76 66',
      accountClean: '221786347666',
      accountName: 'MAISON FRÈRE MIXAGE',
      ussdCode: '#144#391*786347666*',
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
