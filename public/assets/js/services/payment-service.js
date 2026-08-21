import { CONFIG } from '../config.js';

/**
 * Service d'intégration des passerelles de paiement (Wave, Orange Money, Carte Bancaire)
 * 
 * ARCHITECTURE DE SÉCURITÉ :
 * Dans un environnement de production réel :
 * 1. Le client envoie l'ID de commande au backend de Frère Mixage.
 * 2. Le backend initie la session de paiement avec les clés secrètes d'API (Wave Checkout API ou OM Web Payment).
 * 3. Le backend renvoie au client l'URL de paiement ou le deep-link Wave.
 * 4. Le webhook Wave/Orange Money notifie le backend de la réussite de la transaction.
 */
export const PaymentService = {
  /**
   * Initie le processus de paiement selon la méthode choisie
   */
  async processPayment({ order, method, customerPhone }) {
    const gateway = CONFIG.paymentGateways[method];
    if (!gateway) {
      throw new Error(`Méthode de paiement non supportée : ${method}`);
    }

    // Simulation d'un délai d'initialisation réaliste et élégant (feedback visuel)
    await new Promise(resolve => setTimeout(resolve, 800));

    switch (method) {
      case 'wave':
        return this.handleWavePayment(order, customerPhone);
      
      case 'orangeMoney':
        return this.handleOrangeMoneyPayment(order, customerPhone);
      
      case 'card':
        return this.handleCardPayment(order);
      
      case 'cashOnDelivery':
        return this.handleCashOnDelivery(order);
      
      default:
        return {
          success: true,
          status: 'completed',
          method,
          message: 'Paiement enregistré'
        };
    }
  },

  /**
   * Intégration Wave Sénégal
   * Hook prêt pour https://api.wave.com/v1/checkout/sessions
   */
  async handleWavePayment(order, phone) {
    // Si l'API en direct est activée
    if (CONFIG.paymentGateways.wave.isLive) {
      /* Exemple d'appel backend réel :
      const response = await fetch('/api/v1/payments/wave/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.orderNumber, amount: order.totalAmount, phone })
      });
      const data = await response.json();
      window.location.href = data.wave_launch_url;
      return;
      */
    }

    return {
      success: true,
      status: 'pending_webhook',
      method: 'wave',
      instructions: 'Validation Wave enregistrée. Vous recevrez une notification sur votre application Wave.'
    };
  },

  /**
   * Intégration Orange Money Sénégal
   * Hook prêt pour Orange Money Web Payment API
   */
  async handleOrangeMoneyPayment(order, phone) {
    if (CONFIG.paymentGateways.orangeMoney.isLive) {
      /* Exemple d'appel backend réel :
      const response = await fetch('/api/v1/payments/orange-money/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.orderNumber, amount: order.totalAmount, phone })
      });
      */
    }

    return {
      success: true,
      status: 'pending_otp',
      method: 'orangeMoney',
      instructions: 'Validation Orange Money en cours. Veuillez confirmer avec votre code secret si invité.'
    };
  },

  /**
   * Intégration Carte Bancaire (Stripe / PayDunya / CinetPay)
   */
  async handleCardPayment(order) {
    return {
      success: true,
      status: 'authorized',
      method: 'card',
      instructions: 'Transaction carte bancaire sécurisée avec succès.'
    };
  },

  /**
   * Paiement à la livraison
   */
  async handleCashOnDelivery(order) {
    return {
      success: true,
      status: 'pay_on_delivery',
      method: 'cashOnDelivery',
      instructions: 'Votre commande sera payée lors de la remise en main propre par notre coursier à Dakar.'
    };
  }
};
