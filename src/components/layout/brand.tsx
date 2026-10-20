import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";

export async function Brand({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "Brand" });
  return (
    <div className="flex items-center gap-3 px-2">
      <div
        className="flex size-9 items-center justify-center rounded-[9px] bg-lamp font-heading text-xl font-semibold text-lamp-foreground"
        aria-hidden="true"
      >
        U
      </div>
      <div className="flex flex-col leading-tight">
        <span className="font-heading text-base font-semibold text-foreground">
          {t("name")}
        </span>
        <span className="text-xs text-muted-foreground">{t("tagline")}</span>
      </div>
    </div>
  );
}
