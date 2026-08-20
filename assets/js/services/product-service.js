/**
 * Service Produits & Catalogue — Maison Frère Mixage
 * Gère les interactions avec Supabase pour les produits, catégories et variantes.
 */

import { getSupabaseClient } from './supabase-client.js';

export class ProductService {
  /**
   * Récupère tous les produits publiés pour la vitrine publique
   */
  static async getPublishedProducts() {
    try {
      const supabase = await getSupabaseClient();
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          slug,
          description,
          price,
          sale_price,
          fabric,
          lead_time,
          details,
          images,
          is_featured,
          categories (
            id,
            name,
            slug
          ),
          product_variants (
            size,
            stock
          )
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data || data.length === 0) return null;

      // Transformer en format unifié pour l'application
      return data.map(p => {
        const catSlug = p.categories ? p.categories.slug : 'traditionnel';
        const catName = p.categories ? p.categories.name : 'Tenue Traditionnelle';

        const stockMap = {};
        const availableSizes = [];
        if (p.product_variants && p.product_variants.length > 0) {
          p.product_variants.forEach(v => {
            stockMap[v.size] = v.stock;
            if (v.stock > 0 || v.size === 'Sur Mesure') {
              availableSizes.push(v.size);
            }
          });
        }
        if (availableSizes.length === 0) availableSizes.push('M', 'L', 'XL');

        return {
          id: p.slug || p.id,
          dbId: p.id,
          name: p.name,
          category: catSlug,
          categoryLabel: catName,
          price: p.sale_price || p.price,
          originalPrice: p.sale_price ? p.price : null,
          badge: p.sale_price ? 'Promotion' : (p.is_featured ? 'Prestige' : ''),
          featured: p.is_featured,
          leadTime: p.lead_time || 'Disponible sous 24-48h',
          description: p.description || '',
          fabric: p.fabric || '',
          details: p.details || [
            'Finitions haute couture soignées à l’atelier de Dakar',
            'Broderies d’exception faites main'
          ],
          images: p.images && p.images.length > 0 ? p.images : [
            'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&q=85&w=1200'
          ],
          availableSizes: availableSizes,
          stock: stockMap
        };
      });
    } catch (err) {
      console.warn('[ProductService] Échec récupération Supabase, utilisation du cache local :', err.message);
      return null;
    }
  }

  /**
   * Récupère tous les produits (publiés et brouillons) pour le dashboard
   */
  static async getAllProductsAdmin() {
    try {
      const supabase = await getSupabaseClient();
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          slug,
          description,
          price,
          sale_price,
          fabric,
          lead_time,
          status,
          is_featured,
          created_at,
          categories (
            id,
            name,
            slug
          ),
          product_variants (
            size,
            stock
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('[ProductService.getAllProductsAdmin] Erreur :', err);
      return null;
    }
  }

  /**
   * Crée un nouveau produit avec ses variantes de taille dans Supabase
   */
  static async createProduct(productData) {
    const supabase = await getSupabaseClient();
    
    // 1. Récupérer la catégorie ID
    const { data: catData } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', productData.categorySlug || 'traditionnel')
      .single();

    const categoryId = catData ? catData.id : null;

    // 2. Insérer le produit
    const slug = (productData.name || 'tenue').toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString().slice(-4);
    
    const { data: newProd, error: prodError } = await supabase
      .from('products')
      .insert({
        name: productData.name,
        slug: slug,
        category_id: categoryId,
        description: productData.description,
        price: productData.price,
        sale_price: productData.sale_price || null,
        fabric: productData.fabric,
        lead_time: productData.lead_time || 'Disponible sous 24-48h',
        status: productData.status || 'published',
        is_featured: Boolean(productData.is_featured),
        images: productData.images || []
      })
      .select('id')
      .single();

    if (prodError) throw prodError;

    // 3. Insérer les variantes de stock
    if (productData.stock && Object.keys(productData.stock).length > 0) {
      const variantRows = Object.entries(productData.stock).map(([size, qty]) => ({
        product_id: newProd.id,
        size: size,
        stock: parseInt(qty, 10) || 0
      }));

      const { error: varError } = await supabase
        .from('product_variants')
        .insert(variantRows);

      if (varError) console.error('[ProductService] Erreur variantes :', varError);
    }

    return newProd;
  }
}
