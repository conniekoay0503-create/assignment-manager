"use client";

import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { Link } from "@/i18n/navigation";
import type { AuthErrorCode } from "@/lib/validation/auth";
import {
  requestPasswordReset,
  signIn,
  signInWithGoogle,
  signUp,
  updatePassword,
  type FormState,
} from "@/server/actions/auth";
import { Field, FormError, SubmitButton, SuccessPanel } from "./form-parts";

const idle: FormState = { status: "idle" };
const KNOWN_URL_ERRORS: AuthErrorCode[] = ["linkInvalid", "notConfigured", "generic"];

function errorOf(state: FormState) {
  return state.status === "error" ? state.error : null;
}

function GoogleSignIn({ next }: { next?: string }) {
  const t = useTranslations("Auth");
  const locale = useLocale();
  if (process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED !== "true") return null;
  return (
    <>
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        {t("or")}
        <span className="h-px flex-1 bg-border" />
      </div>
      <form action={signInWithGoogle}>
        <input type="hidden" name="locale" value={locale} />
        {next && <input type="hidden" name="next" value={next} />}
        <button
          type="submit"
          className="min-h-11 w-full rounded-[10px] border border-input bg-card px-4 text-sm font-medium hover:bg-muted"
        >
          {t("continueWithGoogle")}
        </button>
      </form>
    </>
  );
}

export function LoginForm() {
  const t = useTranslations("Auth");
  const locale = useLocale();
  const params = useSearchParams();
  const next = params.get("next") ?? undefined;
  const urlError = params.get("error") as AuthErrorCode | null;
  const [state, action] = useActionState(signIn, idle);
  const error = errorOf(state) ?? (urlError && KNOWN_URL_ERRORS.includes(urlError) ? urlError : null);

  return (
    <div className="flex flex-col gap-5">
      <form action={action} className="flex flex-col gap-4" noValidate>
        <input type="hidden" name="locale" value={locale} />
        {next && <input type="hidden" name="next" value={next} />}
        <FormError code={error} />
        <Field name="email" type="email" autoComplete="email" required label={t("email")} />
        <Field name="password" type="password" autoComplete="current-password" required label={t("password")} />
        <Link href="/forgot-password" className="-mt-1 self-end text-sm font-medium">
          {t("login.forgot")}
        </Link>
        <SubmitButton>{t("login.submit")}</SubmitButton>
      </form>
      <GoogleSignIn next={next} />
      <p className="text-center text-sm text-muted-foreground">
        {t("login.noAccount")}{" "}
        <Link href="/signup" className="font-medium">
          {t("login.toSignup")}
        </Link>
      </p>
    </div>
  );
}

export function SignupForm() {
  const t = useTranslations("Auth");
  const locale = useLocale();
  const [state, action] = useActionState(signUp, idle);

  if (state.status === "success") {
    return <SuccessPanel title={t("signup.checkEmailTitle")} body={t("signup.checkEmailBody")} />;
  }

  return (
    <div className="flex flex-col gap-5">
      <form action={action} className="flex flex-col gap-4" noValidate>
        <input type="hidden" name="locale" value={locale} />
        <FormError code={errorOf(state)} />
        <Field name="displayName" autoComplete="name" label={t("displayName")} maxLength={80} />
        <Field name="email" type="email" autoComplete="email" required label={t("email")} />
        <Field
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          label={t("password")}
          hint={t("passwordHint")}
        />
        <SubmitButton>{t("signup.submit")}</SubmitButton>
      </form>
      <GoogleSignIn />
      <p className="text-center text-sm text-muted-foreground">
        {t("signup.hasAccount")}{" "}
        <Link href="/login" className="font-medium">
          {t("signup.toLogin")}
        </Link>
      </p>
    </div>
  );
}

export function ForgotPasswordForm() {
  const t = useTranslations("Auth");
  const locale = useLocale();
  const [state, action] = useActionState(requestPasswordReset, idle);

  return (
    <div className="flex flex-col gap-5">
      {state.status === "success" ? (
        <SuccessPanel title={t("forgot.sentTitle")} body={t("forgot.sentBody")} />
      ) : (
        <form action={action} className="flex flex-col gap-4" noValidate>
          <input type="hidden" name="locale" value={locale} />
          <FormError code={errorOf(state)} />
          <Field name="email" type="email" autoComplete="email" required label={t("email")} />
          <SubmitButton>{t("forgot.submit")}</SubmitButton>
        </form>
      )}
      <Link href="/login" className="text-center text-sm font-medium">
        {t("forgot.back")}
      </Link>
    </div>
  );
}

export function ResetPasswordForm() {
  const t = useTranslations("Auth");
  const locale = useLocale();
  const [state, action] = useActionState(updatePassword, idle);

  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <input type="hidden" name="locale" value={locale} />
      <FormError code={errorOf(state)} />
      <Field
        name="password"
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
        label={t("newPassword")}
        hint={t("passwordHint")}
      />
      <SubmitButton>{t("reset.submit")}</SubmitButton>
    </form>
  );
}
