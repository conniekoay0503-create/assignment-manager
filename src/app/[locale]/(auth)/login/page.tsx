import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/auth-forms";
import { AuthHeading } from "@/components/auth/auth-heading";
import { resolveLocale } from "@/i18n/locale-param";

export default async function Page({ params }: PageProps<"/[locale]/login">) {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "Auth.login" });
  return (
    <>
      <AuthHeading title={t("title")} subtitle={t("subtitle")} />
      <Suspense>
        <LoginForm />
      </Suspense>
    </>
  );
}
