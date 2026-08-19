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
   * Message de commande directe pour une pièce
   */
  generateOrderMessage({ product, size, quantity, customer = null, delivery = null }) {
    const total = product.price * quantity;
    
    let msg = `Bonjour Frère Mixage 👋🏽\n\n`;
    msg += `Je souhaite commander :\n\n`;
    msg += `✨ *Tenue :* ${product.name}\n`;
    msg += `🏷️ *Catégorie :* ${product.categoryLabel}\n`;
    msg += `📏 *Taille :* ${size || 'À définir'}\n`;
    msg += `🔢 *Quantité :* ${quantity}\n`;
    msg += `💰 *Prix unitaire :* ${formatPrice(product.price)}\n`;
    msg += `💵 *Total :* ${formatPrice(total)}\n`;

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
   * Message de suivi d'une commande déjà validée
   */
  generateOrderTrackingMessage(order) {
    let msg = `Bonjour Frère Mixage 👋🏽\n\n`;
    msg += `Je vous contacte concernant ma commande passée sur votre site :\n\n`;
    msg += `🔖 *N° de commande :* ${order.orderNumber}\n`;
    msg += `✨ *Tenue :* ${order.product.name} (Taille ${order.size})\n`;
    msg += `👤 *Client :* ${order.customer.firstName} ${order.customer.lastName}\n`;
    msg += `💰 *Total :* ${formatPrice(order.totalAmount)}\n`;
    msg += `\nJe souhaiterais avoir des informations sur le suivi de livraison. Merci !`;
    return msg;
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
   * Ouvre la conversation générale WhatsApp
   */
  openGeneralChat() {
    const message = `Bonjour Frère Mixage 👋🏽\n\nJ'ai découvert votre maison de couture et je souhaiterais des renseignements sur vos collections.`;
    const url = this.buildUrl(message);
    window.open(url, '_blank', 'noopener,noreferrer');
  }
};
