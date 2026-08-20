/**
 * Service Authentification & Rôles — Maison Frère Mixage
 * Gère Supabase Auth, les sessions et les rôles OWNER / ASSISTANT.
 */

import { getSupabaseClient } from './supabase-client.js';

export class AuthService {
  /**
   * Connexion administrateur
   */
  static async login(email, password) {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    // Récupérer le profil avec le rôle
    const profile = await this.getCurrentProfile(data.user.id);
    return { user: data.user, session: data.session, profile };
  }

  /**
   * Déconnexion
   */
  static async logout() {
    const supabase = await getSupabaseClient();
    const { error } = await supabase.auth.signOut();
    if (error) console.error('[AuthService.logout] Erreur :', error);
  }

  /**
   * Récupère la session active
   */
  static async getSession() {
    try {
      const supabase = await getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    } catch (e) {
      return null;
    }
  }

  /**
   * Récupère le profil et rôle de l'utilisateur connecté
   */
  static async getCurrentProfile(userId = null) {
    try {
      const supabase = await getSupabaseClient();
      let uid = userId;
      if (!uid) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;
        uid = user.id;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('[AuthService.getCurrentProfile] Erreur :', err);
      return null;
    }
  }
}
