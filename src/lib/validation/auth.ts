import { z } from "zod";
import { routing } from "@/i18n/routing";

export const localeSchema = z.enum(routing.locales);

const email = z.string().trim().toLowerCase().email("invalidEmail").max(254, "invalidEmail");

/** Matches supabase/config.toml: at least 8 characters with letters and digits. */
const newPassword = z
  .string()
  .min(8, "passwordTooShort")
  .max(72, "passwordTooLong")
  .regex(/[A-Za-z]/, "passwordNeedsLetter")
  .regex(/[0-9]/, "passwordNeedsDigit");

export const signInSchema = z.object({
  email,
  password: z.string().min(1, "passwordRequired").max(72, "passwordTooLong"),
  locale: localeSchema,
  next: z.string().optional(),
});

export const signUpSchema = z.object({
  email,
  password: newPassword,
  displayName: z.string().trim().max(80, "displayNameTooLong").optional(),
  locale: localeSchema,
});

export const resetRequestSchema = z.object({ email, locale: localeSchema });

export const newPasswordSchema = z.object({ password: newPassword, locale: localeSchema });

export const profileSchema = z.object({
  displayName: z.string().trim().max(80, "displayNameTooLong"),
});

/** Error codes shown to users; each has a translation under Auth.errors. */
export type AuthErrorCode =
  | "invalidEmail"
  | "passwordRequired"
  | "passwordTooShort"
  | "passwordTooLong"
  | "passwordNeedsLetter"
  | "passwordNeedsDigit"
  | "displayNameTooLong"
  | "invalidCredentials"
  | "emailNotConfirmed"
  | "weakPassword"
  | "rateLimited"
  | "notConfigured"
  | "linkInvalid"
  | "generic";

export function firstIssue(error: z.ZodError): AuthErrorCode {
  const message = error.issues[0]?.message;
  return (message as AuthErrorCode) ?? "generic";
}
