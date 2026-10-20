import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { PageHeader } from "@/components/page-header";
import { ProfileForm } from "@/components/settings/profile-form";
import { resolveLocale } from "@/i18n/locale-param";
import { getCurrentUser } from "@/server/session";

export default async function SettingsPage({
  params,
}: PageProps<"/[locale]/settings">) {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "Pages.settings" });

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      <section
        aria-labelledby="profile-heading"
        className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 sm:p-6"
      >
        <h2 id="profile-heading" className="font-heading text-xl font-medium">
          {t("profileTitle")}
        </h2>
        <Suspense fallback={<div className="h-40 animate-pulse rounded-xl bg-muted" />}>
          <ProfileSection />
        </Suspense>
      </section>
      <section
        aria-labelledby="language-heading"
        className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 sm:p-6"
      >
        <h2 id="language-heading" className="font-heading text-xl font-medium">
          {t("languageTitle")}
        </h2>
        <p className="text-sm text-muted-foreground">{t("languageBody")}</p>
        <LanguageSwitcher className="self-start" />
      </section>
    </>
  );
}

async function ProfileSection() {
  const user = await getCurrentUser();
  if (!user) return null;
  return <ProfileForm email={user.email} displayName={user.displayName} />;
}
