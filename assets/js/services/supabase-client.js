/**
 * Client Supabase unifié pour Frère Mixage (Vitrine & Dashboard)
 * Supporte Vite (import.meta.env) et l'environnement de production.
 */

const DEFAULT_SUPABASE_URL = 'https://xcwcecfveyoavqfktsua.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhjd2NlY2Z2ZXlvYXZxZmt0c3VhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcyNDQ3NTYsImV4cCI6MjEwMjgyMDc1Nn0.Tdhfc2NOK4lzVexAXJ1Rqw2Ug2eYQ5XjVwM8pNPLyBc';

let supabaseUrl = DEFAULT_SUPABASE_URL;
let supabaseAnonKey = DEFAULT_SUPABASE_ANON_KEY;

try {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
    supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;
  }
} catch (e) {}

let client = null;

export async function getSupabaseClient() {
  if (client) return client;

  // 1. Essai import ES module standard
  try {
    const supabaseModule = await import('@supabase/supabase-js');
    if (supabaseModule && supabaseModule.createClient) {
      client = supabaseModule.createClient(supabaseUrl, supabaseAnonKey);
      return client;
    }
  } catch (err) {}

  // 2. Fallback CDN dynamique si le module n'est pas résolu
  if (typeof window !== 'undefined' && window.supabase && typeof window.supabase.createClient === 'function') {
    client = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
    return client;
  }

  // 3. Injection CDN
  return new Promise((resolve, reject) => {
    if (typeof document === 'undefined') return resolve(null);
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    script.onload = () => {
      if (window.supabase && window.supabase.createClient) {
        client = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
        resolve(client);
      } else {
        reject(new Error('Échec initialisation Supabase'));
      }
    };
    script.onerror = () => reject(new Error('Impossible de charger la librairie Supabase'));
    document.head.appendChild(script);
  });
}

export const SUPABASE_URL = supabaseUrl;
export const SUPABASE_ANON_KEY = supabaseAnonKey;

