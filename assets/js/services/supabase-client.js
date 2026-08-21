const DEFAULT_SUPABASE_URL = 'https://xcwcecfveyoavqfktsua.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhjd2NlY2Z2ZXlvYXZxZmt0c3VhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcyNDQ3NTYsImV4cCI6MjEwMjgyMDc1Nn0.Tdhfc2NOK4lzVexAXJ1Rqw2Ug2eYQ5XjVwM8pNPLyBc';
const DEFAULT_SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhjd2NlY2Z2ZXlvYXZxZmt0c3VhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzI0NDc1NiwiZXhwIjoyMTAyODIwNzU2fQ.PBUAv0oF1v0rYRybqavCwv-4fVwQWCKwNFSvs_7ngro';

let supabaseUrl = DEFAULT_SUPABASE_URL;
let supabaseAnonKey = DEFAULT_SUPABASE_ANON_KEY;
let supabaseServiceKey = DEFAULT_SUPABASE_SERVICE_ROLE_KEY;

try {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
    supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;
    supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY || DEFAULT_SUPABASE_SERVICE_ROLE_KEY;
  }
} catch (e) {}

let client = null;
let adminClient = null;

export async function getSupabaseClient() {
  if (client) return client;

  if (typeof window !== 'undefined' && window.supabase && typeof window.supabase.createClient === 'function') {
    client = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
    return client;
  }

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

export async function getSupabaseAdminClient() {
  if (adminClient) return adminClient;

  try {
    const module = await import('https://esm.sh/@supabase/supabase-js@2.45.4');
    if (module && module.createClient) {
      adminClient = module.createClient(supabaseUrl, supabaseServiceKey);
      return adminClient;
    }
  } catch (err) {
    console.warn('[SupabaseAdminClient] Import esm.sh :', err.message);
  }

  return getSupabaseClient();
}

export const SUPABASE_URL = supabaseUrl;
export const SUPABASE_ANON_KEY = supabaseAnonKey;
export const SUPABASE_SERVICE_ROLE_KEY = supabaseServiceKey;


