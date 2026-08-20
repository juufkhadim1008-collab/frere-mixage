import { createClient } from '@supabase/supabase-js';

/**
 * Client Supabase partagé de l'application.
 *
 * Ce module n'est importé par aucun composant du site public pour le
 * moment (catalogue, fiche produit, checkout) — il est préparé pour les
 * phases suivantes (auth, dashboard admin, connexion du catalogue).
 * Sa seule présence ici n'a donc aucun effet sur le site actuel.
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[supabase-client] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY manquantes. ' +
    'Copiez .env.example vers .env et renseignez vos clés Supabase.'
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
);
