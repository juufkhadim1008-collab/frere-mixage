/**
 * Service Stocks — Maison Frère Mixage
 * Gère la matrice des stocks temps réel par taille et les mises à jour administratives.
 */

import { getSupabaseClient } from './supabase-client.js';

export class StockService {
  /**
   * Récupère la matrice complète des stocks
   */
  static async getStockMatrix() {
    try {
      const supabase = await getSupabaseClient();
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          slug,
          status,
          categories (name, slug),
          product_variants (
            id,
            size,
            stock,
            updated_at
          )
        `)
        .order('name', { ascending: true });

      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('[StockService.getStockMatrix] Erreur :', err);
      return null;
    }
  }

  /**
   * Met à jour le stock d'une taille spécifique
   */
  static async updateStock(productId, size, quantity) {
    const supabase = await getSupabaseClient();
    const qty = Math.max(0, parseInt(quantity, 10) || 0);

    const { data, error } = await supabase
      .from('product_variants')
      .upsert({
        product_id: productId,
        size: size,
        stock: qty,
        updated_at: new Date().toISOString()
      }, { onConflict: 'product_id,size' })
      .select();

    if (error) throw error;
    return data;
  }
}
