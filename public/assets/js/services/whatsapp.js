import { CONFIG } from '../config.js';
import { formatPrice } from '../products.js';

/**
 * Service de génération de messages et liens WhatsApp pour Frère Mixage
 */
export const WhatsAppService = {
  /**
   * Construit un lien WhatsApp avec un message pré-rempli encodé
   */
  buildUrl(message) {
    const cleanNumber = CONFIG.whatsappNumber.replace(/[^0-9]/g, '');
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
  },

  /**
   * Construit l'URL publique absolue de l'image du produit pour aperçu WhatsApp
   */
  getProductImageUrl(product) {
    if (!product || !product.images || product.images.length === 0) return '';
    const rawImg = product.images[0];
    if (!rawImg || typeof rawImg !== 'string') return '';
    
    // Si c'est déjà une URL web absolue (ex: Supabase Cloud Storage)
    if (rawImg.startsWith('http://') || rawImg.startsWith('https://')) {
      return rawImg;
    }
    
    // Si c'est une image Base64 locale
    if (rawImg.startsWith('data:image')) {
      return '';
    }
    
    // Si c'est un chemin relatif
    const origin = typeof window !== 'undefined' && window.location.origin 
      ? window.location.origin 
      : 'https://frere-mixage.vercel.app';
    const cleanPath = rawImg.replace(/^\.?\//, '');
    return `${origin}/${cleanPath}`;
  },

  /**
   * Message de commande directe pour une pièce avec photo
   */
  generateOrderMessage({ product, size, quantity, customer = null, delivery = null }) {
    const total = product.price * (quantity || 1);
    const imageUrl = this.getProductImageUrl(product);
    
    let msg = `Bonjour Frère Mixage 👋🏽\n\n`;
    msg += `Je souhaite commander :\n\n`;
    msg += `✨ *Tenue :* ${product.name}\n`;
    msg += `🏷️ *Catégorie :* ${product.categoryLabel || product.category || 'Haute Couture'}\n`;
    msg += `📏 *Taille :* ${size || 'À définir'}\n`;
    msg += `🔢 *Quantité :* ${quantity || 1}\n`;
    msg += `💰 *Prix unitaire :* ${formatPrice(product.price)}\n`;
    msg += `💵 *Total :* ${formatPrice(total)}\n`;

    if (imageUrl) {
      msg += `\n📸 *Photo de la création :*\n${imageUrl}\n`;
    }

    if (customer && (customer.firstName || customer.phone)) {
      msg += `\n👤 *Informations client :*\n`;
      msg += `• Nom : ${customer.firstName || ''} ${customer.lastName || ''}\n`;
      msg += `• Téléphone : ${customer.phone || ''}\n`;
      if (customer.address) msg += `• Adresse de livraison : ${customer.address}\n`;
    }

    if (delivery) {
      msg += `🚚 *Livraison :* ${delivery.name}\n`;
    }

    msg += `\nMerci de me confirmer la disponibilité et les modalités.`;

    return msg;
  },

  /**
   * Message pour un devis ou commande Sur Mesure
   */
  generateBespokeMessage() {
    let msg = `Bonjour Frère Mixage 👋🏽\n\n`;
    msg += `Je souhaite concevoir une *création sur mesure* personnalisée.\n`;
    msg += `Pouvez-vous m'indiquer la démarche pour la prise de mesures et le choix des tissus ?\n\n`;
    msg += `Merci !`;
    return msg;
  },

  /**
   * Message de suivi d'une commande déjà validée avec photo
   */
  generateOrderTrackingMessage(order) {
    const imageUrl = this.getProductImageUrl(order.product);

    let msg = `Bonjour Frère Mixage 👋🏽\n\n`;
    msg += `Je vous contacte concernant ma commande passée sur votre site :\n\n`;
    msg += `🔖 *N° de commande :* ${order.orderNumber}\n`;
    msg += `✨ *Tenue :* ${order.product.name} (Taille ${order.size})\n`;
    msg += `👤 *Client :* ${order.customer.firstName} ${order.customer.lastName}\n`;
    msg += `💰 *Total :* ${formatPrice(order.totalAmount)}\n`;

    if (imageUrl) {
      msg += `\n📸 *Photo de la tenue :*\n${imageUrl}\n`;
    }

    msg += `\nJe souhaiterais avoir des informations sur le suivi de livraison. Merci !`;
    return msg;
  },

  /**
   * Message complet avec toutes les informations de commande et preuve de paiement Wave / OM
   */
  generatePaymentConfirmedMessage(order) {
    const isWave = order.payment?.method === 'wave';
    const methodTitle = isWave ? 'Wave Sénégal ⚡' : 'Orange Money Sénégal 🟠';
    const imageUrl = this.getProductImageUrl(order.product);
    const dateFormatted = new Date().toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const recipientPhone = isWave ? '+221 78 241 49 49' : '+221 78 634 76 66';

    let msg = `⚜️ *MAISON FRÈRE MIXAGE — NOUVELLE COMMANDE PAYÉE* ⚜️\n\n`;
    msg += `Bonjour Frère Mixage 👋🏽\n`;
    msg += `Je viens d'effectuer le paiement de ma commande sur votre numéro officiel *${recipientPhone}*.\n\n`;

    msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `🔖 *N° COMMANDE :* ${order.orderNumber}\n`;
    msg += `📅 *Date :* ${dateFormatted}\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

    msg += `👔 *DÉTAILS DE LA CRÉATION :*\n`;
    msg += `• *Modèle :* ${order.product?.name || 'Création Frère Mixage'}\n`;
    msg += `• *Collection :* ${order.product?.categoryLabel || order.product?.category || 'Haute Couture Masculine'}\n`;
    msg += `• *Taille :* ${order.size || 'Sur-Mesure'}\n`;
    msg += `• *Quantité :* ${order.quantity || 1}\n`;
    msg += `• *Prix unitaire :* ${formatPrice(order.product?.price || 0)}\n\n`;

    msg += `💳 *PAIEMENT VALIDÉ :*\n`;
    msg += `• *Moyen :* ${methodTitle}\n`;
    msg += `• *Montant Total :* *${formatPrice(order.totalAmount)}*\n`;
    msg += `• *Numéro émetteur :* ${order.payment?.senderPhone || order.customer?.phone || 'Non précisé'}\n`;
    if (order.payment?.txRef) {
      msg += `• *Réf. Transaction / SMS :* ${order.payment.txRef}\n`;
    }
    msg += `• *Bénéficiaire :* Frère Mixage (${recipientPhone})\n\n`;

    msg += `📍 *COORDONNÉES DE LIVRAISON :*\n`;
    msg += `• *Client :* ${order.customer?.firstName || ''} ${order.customer?.lastName || ''}\n`;
    msg += `• *Téléphone :* ${order.customer?.phone || ''}\n`;
    if (order.customer?.email) {
      msg += `• *Email :* ${order.customer.email}\n`;
    }
    msg += `• *Adresse :* ${order.customer?.address || 'Dakar'}\n`;
    msg += `• *Ville / Région :* ${order.customer?.city || 'Dakar'}\n`;
    if (order.delivery?.name) {
      msg += `• *Option d'envoi :* ${order.delivery.name}\n`;
    }
    if (order.customer?.notes) {
      msg += `• *Instructions particulières :* ${order.customer.notes}\n`;
    }

    if (imageUrl) {
      msg += `\n📸 *Photo de la pièce commandée :*\n${imageUrl}\n`;
    }

    msg += `\n_Merci de me confirmer la bonne réception du paiement et la mise en confection de ma tenue._ ✨`;
    return msg;
  },

  /**
   * Ouvre la conversation WhatsApp avec le message de confirmation de paiement
   */
  openPaymentConfirmationChat(order) {
    const message = this.generatePaymentConfirmedMessage(order);
    const url = this.buildUrl(message);
    window.open(url, '_blank', 'noopener,noreferrer');
  },

  /**
   * Ouvre la conversation WhatsApp dans un nouvel onglet
   */
  openOrderChat(params) {
    const message = this.generateOrderMessage(params);
    const url = this.buildUrl(message);
    window.open(url, '_blank', 'noopener,noreferrer');
  },

  /**
   * Ouvre la conversation WhatsApp dédiée à une création Sur Mesure
   */
  openBespokeChat() {
    const message = this.generateBespokeMessage();
    const url = this.buildUrl(message);
    window.open(url, '_blank', 'noopener,noreferrer');
  },

  /**
   * Ouvre la conversation générale WhatsApp
   */
  openGeneralChat() {
    const message = `Bonjour Frère Mixage 👋🏽\n\nJ'ai découvert votre maison de couture et je souhaiterais des renseignements sur vos collections.`;
    const url = this.buildUrl(message);
    window.open(url, '_blank', 'noopener,noreferrer');
  }
};
