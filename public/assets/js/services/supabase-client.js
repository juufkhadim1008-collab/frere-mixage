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

  // 1. Script CDN global
  if (typeof window !== 'undefined' && window.supabase && typeof window.supabase.createClient === 'function') {
    client = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
    return client;
  }

  // 2. ESM CDN
  try {
    const module = await import('https://esm.sh/@supabase/supabase-js@2.45.4');
    if (module && module.createClient) {
      client = module.createClient(supabaseUrl, supabaseAnonKey);
      return client;
    }
  } catch (err) {
    console.warn('[SupabaseClient] Import dynamique esm.sh :', err.message);
  }

  return null;
}

export const SUPABASE_URL = supabaseUrl;
export const SUPABASE_ANON_KEY = supabaseAnonKey;


