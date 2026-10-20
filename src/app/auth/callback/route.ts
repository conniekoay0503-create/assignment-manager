import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "@/i18n/routing";
import { safeNextPath } from "@/lib/safe-redirect";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

const OTP_TYPES: EmailOtpType[] = ["signup", "invite", "magiclink", "recovery", "email_change", "email"];

/**
 * Landing point for email confirmation, password-reset links and Google sign-in.
 * Exchanges the one-time code for a session cookie, then continues to ?next=.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const fallback = `/${routing.defaultLocale}/dashboard`;
  const next = safeNextPath(searchParams.get("next"), fallback);
  const nextLocale = routing.locales.find((l) => l === next.split("/")[1]) ?? routing.defaultLocale;
  const failure = new URL(`/${nextLocale}/login?error=linkInvalid`, origin);

  if (!isSupabaseConfigured()) return NextResponse.redirect(failure);

  const supabase = await createClient();
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  let ok = false;
  if (code) {
    ok = !(await supabase.auth.exchangeCodeForSession(code)).error;
  } else if (tokenHash && type && OTP_TYPES.includes(type)) {
    ok = !(await supabase.auth.verifyOtp({ token_hash: tokenHash, type })).error;
  }

  return NextResponse.redirect(ok ? new URL(next, origin) : failure);
}
