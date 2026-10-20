import { createServerClient } from "@supabase/ssr";
import type { NextRequest, NextResponse } from "next/server";
import { getSupabaseEnv } from "./env";

/**
 * Refreshes the Supabase session cookies on `response` and returns the verified user id.
 * Returns null when signed out or when Supabase is not configured.
 */
export async function refreshSession(
  request: NextRequest,
  response: NextResponse,
): Promise<string | null> {
  const env = getSupabaseEnv();
  if (!env) return null;

  const supabase = createServerClient(env.url, env.key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        for (const { name, value, options } of cookiesToSet) {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        }
        for (const [key, value] of Object.entries(headers)) {
          response.headers.set(key, value);
        }
      },
    },
  });

  // getClaims() verifies the JWT signature; never trust getSession() alone on the server.
  const { data } = await supabase.auth.getClaims();
  return data?.claims?.sub ?? null;
}
