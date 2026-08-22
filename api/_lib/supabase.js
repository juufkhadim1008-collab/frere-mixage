import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let serverSupabaseClient = null;

export function getServerSupabase() {
  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn('[ServerSupabase] Variables SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquantes.');
    return null;
  }

  if (!serverSupabaseClient) {
    serverSupabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
  }

  return serverSupabaseClient;
}
