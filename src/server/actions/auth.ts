"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { AuthError } from "@supabase/supabase-js";
import type { Locale } from "@/i18n/routing";
import { safeNextPath } from "@/lib/safe-redirect";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import {
  firstIssue,
  localeSchema,
  newPasswordSchema,
  profileSchema,
  resetRequestSchema,
  signInSchema,
  signUpSchema,
  type AuthErrorCode,
} from "@/lib/validation/auth";

export type FormState =
  | { status: "idle" }
  | { status: "error"; error: AuthErrorCode }
  | { status: "success" };

function mapAuthError(error: AuthError): AuthErrorCode {
  switch (error.code) {
    case "invalid_credentials":
      return "invalidCredentials";
    case "email_not_confirmed":
      return "emailNotConfirmed";
    case "weak_password":
      return "weakPassword";
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return "rateLimited";
    default:
      return "generic";
  }
}

async function siteOrigin() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  const h = await headers();
  const origin = h.get("origin");
  if (origin) return origin;
  const proto = h.get("x-forwarded-proto") ?? "https";
  return `${proto}://${h.get("host")}`;
}

function callbackUrl(origin: string, next: string) {
  const url = new URL("/auth/callback", origin);
  url.searchParams.set("next", next);
  return url.toString();
}

export async function signIn(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!isSupabaseConfigured()) return { status: "error", error: "notConfigured" };
  const parsed = signInSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { status: "error", error: firstIssue(parsed.error) };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (error) return { status: "error", error: mapAuthError(error) };

  // Open the app in the language saved on the account, so it follows the user across devices.
  const { data: profile } = await supabase
    .from("profiles")
    .select("preferred_locale")
    .eq("id", data.user.id)
    .single();
  const locale = (profile?.preferred_locale as Locale | undefined) ?? parsed.data.locale;
  redirect(safeNextPath(parsed.data.next, `/${locale}/dashboard`));
}

export async function signUp(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!isSupabaseConfigured()) return { status: "error", error: "notConfigured" };
  const parsed = signUpSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { status: "error", error: firstIssue(parsed.error) };

  const { email, password, displayName, locale } = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: callbackUrl(await siteOrigin(), `/${locale}/dashboard`),
      data: { display_name: displayName || null, preferred_locale: locale },
    },
  });
  if (error) return { status: "error", error: mapAuthError(error) };
  // Same response whether or not the address was already registered, to avoid revealing accounts.
  return { status: "success" };
}

export async function requestPasswordReset(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!isSupabaseConfigured()) return { status: "error", error: "notConfigured" };
  const parsed = resetRequestSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { status: "error", error: firstIssue(parsed.error) };

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: callbackUrl(await siteOrigin(), `/${parsed.data.locale}/reset-password`),
  });
  if (error && mapAuthError(error) === "rateLimited") return { status: "error", error: "rateLimited" };
  return { status: "success" };
}

export async function updatePassword(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!isSupabaseConfigured()) return { status: "error", error: "notConfigured" };
  const parsed = newPasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { status: "error", error: firstIssue(parsed.error) };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { status: "error", error: mapAuthError(error) };
  redirect(`/${parsed.data.locale}/dashboard`);
}

export async function signInWithGoogle(formData: FormData) {
  const locale = localeSchema.catch("en").parse(formData.get("locale"));
  if (!isSupabaseConfigured()) redirect(`/${locale}/login?error=notConfigured`);

  const next = safeNextPath(formData.get("next"), `/${locale}/dashboard`);
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: callbackUrl(await siteOrigin(), next) },
  });
  if (error || !data.url) redirect(`/${locale}/login?error=generic`);
  redirect(data.url);
}

export async function signOut(formData: FormData) {
  const locale = localeSchema.catch("en").parse(formData.get("locale"));
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect(`/${locale}/login`);
}

/** Saves the interface language on the account. Does nothing when signed out. */
export async function savePreferredLocale(locale: string) {
  const parsed = localeSchema.safeParse(locale);
  if (!parsed.success || !isSupabaseConfigured()) return;
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) return;
  await supabase.from("profiles").update({ preferred_locale: parsed.data }).eq("id", userId);
}

export async function updateProfile(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!isSupabaseConfigured()) return { status: "error", error: "notConfigured" };
  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { status: "error", error: firstIssue(parsed.error) };

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) return { status: "error", error: "generic" };
  const { error } = await supabase
    .from("profiles")
    .update({ display_name: parsed.data.displayName || null })
    .eq("id", userId);
  return error ? { status: "error", error: "generic" } : { status: "success" };
}
