import { CONFIG } from '../config.js';

const STORAGE_KEY = 'frere_mixage_orders_v1';

/**
 * Service de gestion des commandes pour Frère Mixage
 */
export const OrderService = {
  /**
   * Génère un numéro de commande unique et prestigieux (ex: FM-2026-8742)
   */
  generateOrderNumber() {
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `FM-${year}-${random}`;
  },

  /**
   * Crée et enregistre une nouvelle commande
   */
  async createOrder({ product, size, quantity, customer, delivery, paymentMethod }) {
    // Calculs
    const subtotal = product.price * quantity;
    const deliveryFee = delivery ? delivery.price : 0;
    const totalAmount = subtotal + deliveryFee;

    const order = {
      orderNumber: this.generateOrderNumber(),
      createdAt: new Date().toISOString(),
      status: 'confirmed', // 'pending', 'confirmed', 'in_preparation', 'shipped', 'delivered', 'cancelled'
      product: {
        id: product.id,
        name: product.name,
        category: product.categoryLabel,
        price: product.price,
        image: product.images[0]
      },
      size,
      quantity,
      subtotal,
      deliveryFee,
      totalAmount,
      customer: {
        firstName: customer.firstName.trim(),
        lastName: customer.lastName.trim(),
        phone: customer.phone.trim(),
        address: customer.address.trim(),
        city: customer.city ? customer.city.trim() : 'Dakar',
        notes: customer.notes ? customer.notes.trim() : ''
      },
      delivery: {
        id: delivery?.id || 'dakar-express',
        name: delivery?.name || 'Livraison standard'
      },
      payment: {
        method: paymentMethod, // 'wave', 'orangeMoney', 'card', 'cashOnDelivery'
        status: paymentMethod === 'cashOnDelivery' ? 'pending_on_delivery' : 'processing',
        transactionRef: `TXN-${Date.now()}`
      }
    };

    // 1. Sauvegarde locale pour consultation et suivi
    this.saveOrderLocally(order);

    // 2. Point d'intégration Backend (prêt pour un envoi sécurisé vers votre serveur)
    try {
      if (CONFIG.api.createOrderUrl && !CONFIG.api.createOrderUrl.startsWith('/api')) {
        await fetch(CONFIG.api.createOrderUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(order)
        });
      }
    } catch (e) {
      console.warn('[OrderService] Mode hors-ligne / mockup serveur actif.');
    }

    return order;
  },

  /**
   * Sauvegarde une commande dans le stockage local du navigateur
   */
  saveOrderLocally(order) {
    try {
      const orders = this.getOrders();
      orders.unshift(order);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    } catch (e) {
      console.error('Erreur sauvegarde locale commande', e);
    }
  },

  /**
   * Récupère la liste des commandes locales
   */
  getOrders() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  },

  /**
   * Récupère la dernière commande passée
   */
  getLastOrder() {
    const orders = this.getOrders();
    return orders.length > 0 ? orders[0] : null;
  }
};
