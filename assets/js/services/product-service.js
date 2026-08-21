/**
 * Service Produits & Catalogue — Maison Frère Mixage
 * Gère les interactions avec Supabase pour les produits, catégories et variantes.
 */

import { getSupabaseClient, SUPABASE_URL, SUPABASE_ANON_KEY } from './supabase-client.js';

export class ProductService {
  /**
   * Récupère tous les produits publiés pour la vitrine publique
   */
  static async getPublishedProducts() {
    let rawData = null;

    // 1. Essayer via le client Supabase
    try {
      const supabase = await getSupabaseClient();
      if (supabase) {
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

        if (!error && Array.isArray(data)) rawData = data;
      }
    } catch (err) {
      console.warn('[ProductService] Échec client SDK, bascule sur fetch REST :', err.message);
    }

    // 2. Fallback direct HTTP Fetch REST (100% fiable en toute circonstance)
    if (!rawData) {
      try {
        const url = `${SUPABASE_URL}/rest/v1/products?select=id,name,slug,description,price,sale_price,fabric,lead_time,details,images,is_featured,categories(id,name,slug),product_variants(size,stock)&status=eq.published&order=created_at.desc`;
        const res = await fetch(url, {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          }
        });
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json)) rawData = json;
        }
      } catch (fetchErr) {
        console.error('[ProductService] Erreur fetch REST direct :', fetchErr);
      }
    }

    if (!rawData || rawData.length === 0) return null;

    // Transformer en format unifié pour l'application
    return rawData.map(p => {
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

      const validImages = (p.images && p.images.length > 0 && !p.images[0].includes('1617137984095') && !p.images[0].includes('unsplash'))
        ? p.images
        : ['/assets/images/hero-frere-mixage.jpg'];

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
        images: validImages,
        availableSizes: availableSizes,
        stock: stockMap
      };
    });
  }

  /**
   * Récupère tous les produits (publiés et brouillons) pour le dashboard
   */
  static async getAllProductsAdmin() {
    let rawData = null;

    // 1. Essayer avec le client Supabase
    try {
      const supabase = await getSupabaseClient();
      if (supabase) {
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
            images,
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

        if (!error && Array.isArray(data)) rawData = data;
      }
    } catch (err) {
      console.warn('[ProductService.getAllProductsAdmin] SDK error, fallback to REST fetch:', err);
    }

    // 2. Fallback direct HTTP Fetch REST (100% fiable)
    if (!rawData) {
      try {
        const url = `${SUPABASE_URL}/rest/v1/products?select=id,name,slug,description,price,sale_price,fabric,lead_time,status,is_featured,images,created_at,categories(id,name,slug),product_variants(size,stock)&order=created_at.desc`;
        const res = await fetch(url, {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          }
        });
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json)) rawData = json;
        }
      } catch (fetchErr) {
        console.error('[ProductService.getAllProductsAdmin] REST fetch error:', fetchErr);
      }
    }

    return rawData;
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

  /**
   * Met à jour un produit existant dans Supabase
   */
  static async updateProduct(productId, productData) {
    const supabase = await getSupabaseClient();

    // 1. Récupérer la catégorie ID
    const { data: catData } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', productData.categorySlug || 'traditionnel')
      .maybeSingle();

    const categoryId = catData ? catData.id : null;

    // 2. Mettre à jour le produit
    const updatePayload = {
      name: productData.name,
      description: productData.description,
      price: productData.price,
      sale_price: productData.sale_price || null,
      fabric: productData.fabric,
      status: productData.status || 'published',
      is_featured: Boolean(productData.is_featured),
      images: productData.images || [],
      updated_at: new Date().toISOString()
    };
    if (categoryId) updatePayload.category_id = categoryId;

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(productId);
    let resolvedDbId = isUuid ? productId : null;

    if (isUuid) {
      const { error: prodError } = await supabase
        .from('products')
        .update(updatePayload)
        .eq('id', productId);

      if (prodError) console.warn('[ProductService.updateProduct] UUID update warning:', prodError.message);
    } else {
      const { data: existingProd } = await supabase
        .from('products')
        .select('id')
        .eq('slug', productId)
        .maybeSingle();

      if (existingProd) {
        resolvedDbId = existingProd.id;
        const { error: prodError } = await supabase
          .from('products')
          .update(updatePayload)
          .eq('id', existingProd.id);

        if (prodError) console.warn('[ProductService.updateProduct] Slug update warning:', prodError.message);
      } else {
        const slug = productId || (productData.name || 'tenue').toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString().slice(-4);
        const { data: inserted, error: insertError } = await supabase
          .from('products')
          .insert({
            ...updatePayload,
            slug: slug
          })
          .select('id')
          .maybeSingle();

        if (inserted) resolvedDbId = inserted.id;
        if (insertError) console.warn('[ProductService.updateProduct] Insert warning:', insertError.message);
      }
    }

    // 3. Mettre à jour les variantes
    if (resolvedDbId && productData.stock) {
      for (const [size, qty] of Object.entries(productData.stock)) {
        await supabase
          .from('product_variants')
          .upsert({
            product_id: resolvedDbId,
            size: size,
            stock: parseInt(qty, 10) || 0
          }, { onConflict: 'product_id,size' });
      }
    }

    return { id: resolvedDbId };
  }

  /**
   * Supprime un produit et ses variantes de Supabase
   */
  static async deleteProduct(productId) {
    const supabase = await getSupabaseClient();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(productId);
    
    let targetId = isUuid ? productId : null;
    if (!isUuid) {
      const { data: found } = await supabase.from('products').select('id').eq('slug', productId).maybeSingle();
      if (found) targetId = found.id;
    }

    if (targetId) {
      await supabase.from('product_variants').delete().eq('product_id', targetId);
      const { error } = await supabase.from('products').delete().eq('id', targetId);
      if (error) console.warn('[ProductService.deleteProduct] Warning:', error.message);
    }
  }
}

