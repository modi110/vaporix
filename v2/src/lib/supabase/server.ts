import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * The only Supabase client in the project.
 *
 * It holds the service-role key, which bypasses row-level security. Every
 * loyalty table has RLS enabled with no policies at all, so this client is the
 * only thing in the world that can read or write them — which is the point:
 * a customer cannot set their own visit count because their browser has no
 * path to the database that does not pass through our own server code first.
 *
 * `server-only` above turns any accidental import from a client component
 * into a build error rather than a leaked key.
 */
let cached: SupabaseClient | null = null;

export function serviceClient(): SupabaseClient {
  if (cached) return cached;

  // Read lazily rather than at module scope: a missing variable should fail
  // the request that needs it, not the whole build.
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase is not configured. Set SUPABASE_URL and " +
        "SUPABASE_SERVICE_ROLE_KEY in .env.local (see .env.example).",
    );
  }

  cached = createClient(url, key, {
    // No user sessions here — this client is a trusted backend caller, not a
    // signed-in person. Persisting or refreshing anything would be wrong.
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return cached;
}
