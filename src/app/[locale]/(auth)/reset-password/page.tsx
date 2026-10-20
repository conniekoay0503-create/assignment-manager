import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/auth/auth-forms";
import { AuthHeading } from "@/components/auth/auth-heading";
import { resolveLocale } from "@/i18n/locale-param";

export default async function Page({ params }: PageProps<"/[locale]/reset-password">) {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "Auth.reset" });
  return (
    <>
      <AuthHeading title={t("title")} />
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
    </>
  );
}
