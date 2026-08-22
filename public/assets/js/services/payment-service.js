import { CONFIG } from '../config.js';

/**
 * Service de gestion des paiements officiels Wave & Orange Money — Maison Frère Mixage
 */
export const PaymentService = {
  /**
   * Construit le lien de paiement direct Wave pour mobile
   */
  getWaveDirectPaymentUrl(amount) {
    const cleanPhone = CONFIG.paymentGateways.wave.accountClean || '221786347666';
    // Deep-link / Web URL de transfert Wave
    return `https://wave.com/send?phone=${cleanPhone}&amount=${amount}`;
  },

  /**
   * Construit le code USSD / syntaxe rapide Orange Money
   */
  getOrangeMoneyUSSD(amount) {
    const code = CONFIG.paymentGateways.orangeMoney.ussdCode || '#144#391*786347666*';
    return `${code}${amount}#`;
  },

  /**
   * Validation de paiement Wave ou Orange Money
   */
  async processPayment({ order, method, senderPhone, txRef }) {
    const gateway = CONFIG.paymentGateways[method];
    if (!gateway) {
      throw new Error(`Méthode de paiement non supportée : ${method}`);
    }

    if (!senderPhone || senderPhone.trim().length < 8) {
      throw new Error('Veuillez renseigner le numéro de téléphone utilisé pour le paiement.');
    }

    // Simulation de délai de contrôle sécurisé
    await new Promise(resolve => setTimeout(resolve, 600));

    return {
      success: true,
      status: 'payment_submitted',
      method,
      senderPhone: senderPhone.trim(),
      txRef: txRef ? txRef.trim() : `TX-${Date.now().toString().slice(-6)}`,
      recipientNumber: gateway.accountNumber,
      recipientName: gateway.accountName,
      message: `Paiement ${gateway.name} enregistré avec succès.`
    };
  }
};

