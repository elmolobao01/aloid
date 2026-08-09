import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/**
 * Cliente Supabase para uso server-side com a chave pública.
 * Respeita RLS e não utiliza service_role.
 */
export function createPublicServerClient() {
  if (!supabaseUrl) {
    throw new Error(
      'Variável NEXT_PUBLIC_SUPABASE_URL não configurada.'
    );
  }

  if (!supabasePublishableKey) {
    throw new Error(
      'Variável NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY não configurada.'
    );
  }

  return createClient(supabaseUrl, supabasePublishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
