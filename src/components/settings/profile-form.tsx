"use client";

import { useTranslations } from "next-intl";
import { useActionState } from "react";
import { Field, FormError, SubmitButton } from "@/components/auth/form-parts";
import { updateProfile, type FormState } from "@/server/actions/auth";

export function ProfileForm({ email, displayName }: { email: string | null; displayName: string | null }) {
  const t = useTranslations("Pages.settings");
  const common = useTranslations("Common");
  const [state, action] = useActionState(updateProfile, { status: "idle" } as FormState);

  return (
    <form action={action} className="flex max-w-md flex-col gap-4">
      <FormError code={state.status === "error" ? state.error : null} />
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium">{t("profileEmail")}</span>
        <span className="text-sm text-muted-foreground">{email}</span>
      </div>
      <Field name="displayName" defaultValue={displayName ?? ""} maxLength={80} label={t("profileName")} />
      <div className="flex items-center gap-3">
        <SubmitButton>{common("save")}</SubmitButton>
        {state.status === "success" && (
          <span role="status" className="text-sm text-success">
            {common("saved")}
          </span>
        )}
      </div>
    </form>
  );
}
