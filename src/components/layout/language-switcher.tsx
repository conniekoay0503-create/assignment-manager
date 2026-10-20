"use client";

import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { savePreferredLocale } from "@/server/actions/auth";

/**
 * Switches the interface language while keeping the current page, and saves the
 * choice to the signed-in user's profile so it follows them to other devices.
 */
export function LanguageSwitcher({ className }: { className?: string }) {
  const t = useTranslations("Language");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function switchTo(next: Locale) {
    if (next === locale) return;
    startTransition(async () => {
      await savePreferredLocale(next);
      router.replace(pathname, { locale: next });
    });
  }

  return (
    <div
      role="group"
      aria-label={t("label")}
      className={cn(
        "flex overflow-hidden rounded-[10px] border border-input bg-card",
        isPending && "opacity-70",
        className,
      )}
    >
      {routing.locales.map((l) => {
        const selected = l === locale;
        return (
          <button
            key={l}
            type="button"
            lang={l}
            aria-pressed={selected}
            aria-label={t(`${l}Full`)}
            onClick={() => switchTo(l)}
            className={cn(
              "min-h-10 px-3.5 text-sm transition-colors",
              selected
                ? "bg-secondary font-semibold text-secondary-foreground"
                : "text-sidebar-foreground hover:bg-muted",
            )}
          >
            {t(l)}
          </button>
        );
      })}
    </div>
  );
}
