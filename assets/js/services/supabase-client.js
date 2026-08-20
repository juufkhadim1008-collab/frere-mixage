import { createClient } from '@supabase/supabase-js';

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
  if (typeof createClient === 'function') {
    client = createClient(supabaseUrl, supabaseAnonKey);
    return client;
  }
  if (typeof window !== 'undefined' && window.supabase && typeof window.supabase.createClient === 'function') {
    client = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
    return client;
  }
  return null;
}

export const SUPABASE_URL = supabaseUrl;
export const SUPABASE_ANON_KEY = supabaseAnonKey;

