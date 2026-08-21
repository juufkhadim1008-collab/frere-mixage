/**
 * Service Commandes — Maison Frère Mixage
 * Traite les commandes de manière atomique et sécurisée via la fonction RPC Supabase.
 */

import { getSupabaseClient } from './supabase-client.js';

export class OrderService {
  /**
   * Crée une commande de manière transactionnelle côté serveur
   * Vérifie le stock, calcule les prix serveur et décrémente le stock en une seule transaction atomique.
   */
  static async createOrderAtomic(payload) {
    try {
      const supabase = await getSupabaseClient();
      
      const { data, error } = await supabase.rpc('process_order_atomic', {
        p_customer_name: payload.customerName,
        p_customer_phone: payload.customerPhone,
        p_customer_email: payload.customerEmail || null,
        p_delivery_address: payload.deliveryAddress || 'Dakar',
        p_delivery_city: payload.deliveryCity || 'Dakar',
        p_payment_method: payload.paymentMethod || 'cash_on_delivery',
        p_notes: payload.notes || null,
        p_items: payload.items.map(item => ({
          product_id: item.productId || null,
          product_slug: item.productSlug || item.productId || null,
          size: item.size,
          quantity: parseInt(item.quantity, 10) || 1
        }))
      });

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('[OrderService.createOrderAtomic] Erreur transactionnelle :', err);
      throw err;
    }
  }

  /**
   * Récupère la liste des commandes pour le Dashboard Administrateur
   */
  static async getAllOrdersAdmin() {
    try {
      const supabase = await getSupabaseClient();
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          status,
          subtotal,
          delivery_fee,
          total,
          payment_method,
          payment_status,
          delivery_address,
          notes,
          created_at,
          customers (
            id,
            full_name,
            phone,
            email,
            city,
            address
          ),
          order_items (
            id,
            product_name_snapshot,
            size,
            quantity,
            unit_price,
            total_price
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('[OrderService.getAllOrdersAdmin] Erreur :', err);
      return null;
    }
  }

  /**
   * Met à jour le statut d'une commande
   */
  static async updateOrderStatus(orderId, newStatus) {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
      .from('orders')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
