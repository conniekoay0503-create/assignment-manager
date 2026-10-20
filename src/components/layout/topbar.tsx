import { Bell, Plus, Search } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { Brand } from "./brand";
import { LanguageSwitcher } from "./language-switcher";
import { MobileNav } from "./mobile-nav";
import { UserSlot } from "./user-slot";

export async function Topbar({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "Topbar" });

  return (
    <header className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3 sm:px-8">
      <MobileNav brand={<Brand locale={locale} />} />
      <div className="relative min-w-0 flex-[1_1_220px]">
        <label htmlFor="global-search" className="sr-only">
          {t("searchLabel")}
        </label>
        <Search
          className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <input
          id="global-search"
          type="search"
          placeholder={t("searchPlaceholder")}
          className="h-11 w-full max-w-[440px] rounded-[10px] border border-input bg-card pr-3.5 pl-10 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-3 focus-visible:ring-ring/40"
        />
      </div>
      <LanguageSwitcher />
      <Link
        href="/notifications"
        aria-label={t("notifications")}
        className="flex size-11 items-center justify-center rounded-[10px] border border-input bg-card text-sidebar-foreground hover:bg-muted"
      >
        <Bell className="size-[18px]" aria-hidden="true" />
      </Link>
      <Link
        href="/tasks"
        className="inline-flex min-h-11 items-center gap-1.5 rounded-[10px] bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
      >
        <Plus className="size-4" aria-hidden="true" />
        {t("newTask")}
      </Link>
      <Suspense fallback={<div className="size-11 rounded-full bg-muted" aria-hidden="true" />}>
        <UserSlot />
      </Suspense>
    </header>
  );
}
