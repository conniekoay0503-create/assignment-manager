import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { ForgotPasswordForm } from "@/components/auth/auth-forms";
import { AuthHeading } from "@/components/auth/auth-heading";
import { resolveLocale } from "@/i18n/locale-param";

export default async function Page({ params }: PageProps<"/[locale]/forgot-password">) {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "Auth.forgot" });
  return (
    <>
      <AuthHeading title={t("title")} subtitle={t("subtitle")} />
      <Suspense>
        <ForgotPasswordForm />
      </Suspense>
    </>
  );
}
