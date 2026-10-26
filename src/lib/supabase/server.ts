import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Server-Side Supabase Client Provider
 *
 * Exclusively instantiated in Node.js server runtimes (Route Handlers, Server Components).
 * Never exposes the privileged service-role key to client browsers.
 */
let cachedServerClient: SupabaseClient | null = null;

export function getServerSupabaseClient(): SupabaseClient | null {
  if (cachedServerClient) {
    return cachedServerClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const apiKey = serviceRoleKey || anonKey;

  // Verify non-empty, non-placeholder credentials
  if (
    !supabaseUrl ||
    !apiKey ||
    supabaseUrl.includes('your-project.supabase.co') ||
    apiKey.includes('placeholder')
  ) {
    return null;
  }

  try {
    cachedServerClient = createClient(supabaseUrl, apiKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    return cachedServerClient;
  } catch (err) {
    console.warn('[SupabaseServer] Could not initialize server client:', err);
    return null;
  }
}

export function isServerSupabaseConfigured(): boolean {
  return getServerSupabaseClient() !== null;
}
