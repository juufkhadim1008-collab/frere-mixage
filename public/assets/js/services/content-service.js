/**
 * Service de Contenu Dynamique — Maison Frère Mixage
 * Synchronise les témoignages, le contenu de l'atelier et les paramètres avec Supabase Cloud.
 */

import { getSupabaseClient } from './supabase-client.js';

export class ContentService {
  /**
   * Récupère tous les témoignages actifs pour la vitrine publique
   */
  static async getPublicTestimonials() {
    try {
      const supabase = await getSupabaseClient();
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.warn('[ContentService.getPublicTestimonials] Fallback local :', err.message);
      return null;
    }
  }

  /**
   * Récupère tous les témoignages pour l'administration
   */
  static async getAllTestimonialsAdmin() {
    try {
      const supabase = await getSupabaseClient();
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.warn('[ContentService.getAllTestimonialsAdmin] Fallback local :', err.message);
      return [];
    }
  }

  /**
   * Enregistre ou modifie un témoignage dans Supabase
   */
  static async saveTestimonial(item) {
    const supabase = await getSupabaseClient();
    
    if (item.id && !item.id.startsWith('test-')) {
      const { data, error } = await supabase
        .from('testimonials')
        .update({
          name: item.name,
          role: item.role,
          quote: item.quote,
          rating: item.rating,
          avatar_url: item.avatar || item.avatar_url,
          is_active: item.isActive !== undefined ? item.isActive : item.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', item.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase
        .from('testimonials')
        .insert({
          name: item.name,
          role: item.role,
          quote: item.quote,
          rating: item.rating,
          avatar_url: item.avatar || item.avatar_url,
          is_active: item.isActive !== undefined ? item.isActive : item.is_active
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  }

  /**
   * Supprime un témoignage de Supabase
   */
  static async deleteTestimonial(id) {
    if (!id || id.startsWith('test-')) return;
    const supabase = await getSupabaseClient();
    const { error } = await supabase
      .from('testimonials')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * Récupère le contenu de la section "Les Coulisses de l'Atelier"
   */
  static async getAboutContent() {
    try {
      const supabase = await getSupabaseClient();
      const { data, error } = await supabase
        .from('store_settings')
        .select('value')
        .eq('key', 'about')
        .single();

      if (error) throw error;
      return data ? data.value : null;
    } catch (err) {
      console.warn('[ContentService.getAboutContent] Fallback local :', err.message);
      return null;
    }
  }

  /**
   * Enregistre le contenu de l'atelier dans Supabase
   */
  static async saveAboutContent(aboutData) {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
      .from('store_settings')
      .upsert({
        key: 'about',
        value: aboutData,
        updated_at: new Date().toISOString()
      }, { onConflict: 'key' })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
