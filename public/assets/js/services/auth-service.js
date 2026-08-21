/**
 * Service Authentification & Rôles par Téléphone — Maison Frère Mixage
 * Gère Supabase Auth par téléphone (+221...), les sessions et les rôles OWNER / ASSISTANT.
 */

import { getSupabaseClient } from './supabase-client.js';

export class AuthService {
  /**
   * Normalise intelligemment les numéros de téléphone au format standard international (+221XXXXXXXXX)
   */
  static normalizePhone(rawPhone) {
    if (!rawPhone) return '';
    // Retirer espaces, tirets, parenthèses, points
    let cleaned = rawPhone.toString().replace(/[\s\-\(\)\.]/g, '');

    // Remplacer 00221 par +221
    if (cleaned.startsWith('00221')) {
      cleaned = '+' + cleaned.substring(2);
    }

    // Si commence par +221
    if (cleaned.startsWith('+221')) {
      return cleaned;
    }

    // Si commence par 221
    if (cleaned.startsWith('221') && cleaned.length >= 12) {
      return '+' + cleaned;
    }

    // Si numéro local sénégalais à 9 chiffres (ex: 771234567 ou 70, 76, 78, 33)
    if (/^[37][0-9]{8}$/.test(cleaned)) {
      return '+221' + cleaned;
    }

    // Si commence déjà par un autre indicatif (+)
    if (cleaned.startsWith('+')) {
      return cleaned;
    }

    return '+221' + cleaned;
  }

  /**
   * Formate un numéro de téléphone pour l'affichage (+221 77 123 45 67)
   */
  static formatPhoneDisplay(phone) {
    if (!phone) return '';
    const norm = this.normalizePhone(phone);
    if (norm.startsWith('+221') && norm.length === 13) {
      return `+221 ${norm.slice(4, 6)} ${norm.slice(6, 9)} ${norm.slice(9, 11)} ${norm.slice(11, 13)}`;
    }
    return norm;
  }

  /**
   * Connexion administrateur avec Téléphone + Mot de passe
   */
  static async loginWithPhone(phoneInput, password) {
    const supabase = await getSupabaseClient();
    const normalizedPhone = this.normalizePhone(phoneInput);

    if (!normalizedPhone) {
      throw new Error('Veuillez saisir un numéro de téléphone valide.');
    }
    if (!password) {
      throw new Error('Veuillez saisir votre mot de passe.');
    }

    // Connexion Supabase Auth via Phone
    const { data, error } = await supabase.auth.signInWithPassword({
      phone: normalizedPhone,
      password: password
    });

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('Numéro de téléphone ou mot de passe incorrect.');
      }
      throw error;
    }

    // Récupérer le profil et vérifier le statut du compte
    const profile = await this.getCurrentProfile(data.user.id);
    
    if (profile && profile.is_active === false) {
      await supabase.auth.signOut();
      throw new Error('Ce compte a été désactivé par le propriétaire. Contactez votre administrateur.');
    }

    // Enregistrer l'activité de connexion
    try {
      await supabase.from('activity_logs').insert({
        user_id: data.user.id,
        action: 'login',
        entity_type: 'auth',
        entity_id: data.user.id,
        description: `${profile ? profile.full_name : 'Utilisateur'} s'est connecté au dashboard.`
      });
    } catch (e) {}

    return { user: data.user, session: data.session, profile };
  }

  /**
   * Déconnexion sécurisée
   */
  static async logout() {
    try {
      const supabase = await getSupabaseClient();
      await supabase.auth.signOut();
    } catch (error) {
      console.error('[AuthService.logout] Erreur :', error);
    }
    // Nettoyer les traces locales et rediriger
    sessionStorage.clear();
    window.location.href = './login.html';
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
      console.warn('[AuthService.getCurrentProfile] Erreur :', err.message);
      return null;
    }
  }

  /**
   * Récupère la liste de tous les membres de l'équipe (OWNER uniquement)
   */
  static async getTeamMembers() {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  }

  /**
   * Création sécurisée d'un nouvel assistant par le Propriétaire
   */
  static async createAssistant(fullName, rawPhone, password) {
    const supabase = await getSupabaseClient();
    const normalizedPhone = this.normalizePhone(rawPhone);

    const { data, error } = await supabase.rpc('admin_create_assistant', {
      p_full_name: fullName,
      p_phone: normalizedPhone,
      p_password: password
    });

    if (error) throw error;
    return data;
  }

  /**
   * Activation ou désactivation du compte d'un assistant (OWNER uniquement)
   */
  static async toggleUserStatus(userId, isActive) {
    const supabase = await getSupabaseClient();

    const { data, error } = await supabase.rpc('admin_toggle_user_status', {
      p_user_id: userId,
      p_is_active: isActive
    });

    if (error) throw error;
    return data;
  }
}
