import { getTranslations } from "next-intl/server";
import { Brand } from "@/components/layout/brand";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { resolveLocale } from "@/i18n/locale-param";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default async function AuthLayout({ children, params }: LayoutProps<"/[locale]">) {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "Auth" });

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between gap-3 px-4 py-4 sm:px-8">
        <Brand locale={locale} />
        <LanguageSwitcher />
      </header>
      <main className="flex flex-1 items-start justify-center px-4 pt-6 pb-16 sm:pt-14">
        <div className="ruled flex w-full max-w-[440px] flex-col gap-6 rounded-[18px] border border-focus-border bg-card p-6 sm:p-8">
          {!isSupabaseConfigured() && (
            <div role="note" className="flex flex-col gap-1 rounded-xl bg-[#fff1cf] px-4 py-3 text-sm text-[#4d3400]">
              <p className="font-semibold">{t("notConfiguredTitle")}</p>
              <p>{t("notConfiguredBody")}</p>
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}
