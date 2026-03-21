import { createClient } from '@supabase/supabase-js';

let supabaseClient = null;

function readEnv(name) {
  const value = import.meta.env[name];

  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`${name} is required to use Supabase. Add it to your .env file before calling the auth or data layer.`);
  }

  return value;
}

export function hasSupabaseConfig() {
  return Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
}

export function getSupabaseConfig() {
  return {
    url: readEnv('VITE_SUPABASE_URL'),
    anonKey: readEnv('VITE_SUPABASE_ANON_KEY'),
  };
}

export function getSupabaseClient() {
  if (supabaseClient) {
    return supabaseClient;
  }

  const { url, anonKey } = getSupabaseConfig();

  supabaseClient = createClient(url, anonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });

  return supabaseClient;
}
