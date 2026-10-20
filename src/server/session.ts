import "server-only";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export type CurrentUser = {
  id: string;
  email: string | null;
  displayName: string | null;
  preferredLocale: string;
};

/** The signed-in user with their profile, or null. Reads cookies, so render it inside <Suspense>. */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, preferred_locale")
    .eq("id", claims.sub)
    .single();

  return {
    id: claims.sub,
    email: typeof claims.email === "string" ? claims.email : null,
    displayName: profile?.display_name ?? null,
    preferredLocale: profile?.preferred_locale ?? "en",
  };
}
