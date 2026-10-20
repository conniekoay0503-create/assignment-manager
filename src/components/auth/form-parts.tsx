"use client";

import { useTranslations } from "next-intl";
import { useFormStatus } from "react-dom";
import type { AuthErrorCode } from "@/lib/validation/auth";

export function Field({
  label,
  hint,
  ...input
}: { label: string; hint?: string } & React.ComponentProps<"input"> & { name: string }) {
  const id = `field-${input.name}`;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className="h-11 rounded-[10px] border border-input bg-card px-3.5 text-[15px] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
        {...input}
      />
      {hint && (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
    </div>
  );
}

export function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  const t = useTranslations("Auth");
  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className="min-h-11 rounded-[10px] bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-70"
    >
      {pending ? t("pending") : children}
    </button>
  );
}

export function FormError({ code }: { code?: AuthErrorCode | null }) {
  const t = useTranslations("Auth.errors");
  if (!code) return null;
  return (
    <p role="alert" className="rounded-[10px] bg-overdue-soft px-3.5 py-2.5 text-sm text-overdue">
      {t(code)}
    </p>
  );
}

export function SuccessPanel({ title, body }: { title: string; body: string }) {
  return (
    <div role="status" className="flex flex-col gap-2 rounded-xl bg-success-soft px-4 py-4 text-success">
      <p className="font-heading text-lg font-medium">{title}</p>
      <p className="text-sm">{body}</p>
    </div>
  );
}
