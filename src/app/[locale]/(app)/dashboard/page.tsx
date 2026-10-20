import { ArrowRight, CalendarDays } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { EmptyState } from "@/components/empty-state";
import { TodayDate } from "@/components/today-date";
import { Link } from "@/i18n/navigation";
import { resolveLocale } from "@/i18n/locale-param";

export default async function DashboardPage({
  params,
}: PageProps<"/[locale]/dashboard">) {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "Dashboard" });

  // Statistics come from the signed-in user's records once the database is connected (Phase 3+).
  const summary = [
    { key: "dueToday", tone: "text-accent-foreground" },
    { key: "overdue", tone: "text-overdue" },
    { key: "inProgress", tone: "text-foreground" },
    { key: "cgpa", tone: "text-foreground" },
  ] as const;

  return (
    <>
      <section
        aria-labelledby="today-heading"
        className="ruled relative overflow-hidden rounded-[18px] border border-focus-border bg-focus px-6 py-8 sm:px-9"
      >
        <div
          className="absolute inset-y-0 left-5 w-px bg-lamp/40"
          aria-hidden="true"
        />
        <div className="flex max-w-2xl flex-col gap-4 pl-3">
          <TodayDate className="text-[13px] tracking-wide text-muted-foreground" />
          <h1
            id="today-heading"
            className="font-heading text-3xl leading-tight font-medium tracking-tight text-lamp-foreground sm:text-[40px]"
          >
            {t("greeting")}
          </h1>
          <p className="text-sidebar-foreground">{t("subtitle")}</p>
          <Link
            href="/semesters"
            className="inline-flex min-h-11 items-center gap-2 self-start rounded-[10px] bg-lamp px-[18px] text-sm font-semibold text-lamp-foreground hover:bg-lamp/90"
          >
            {t("startCta")}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section
        aria-label={t("summaryLabel")}
        className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3.5"
      >
        {summary.map(({ key, tone }) => (
          <div
            key={key}
            className="flex flex-col gap-0.5 rounded-[14px] border border-border bg-card px-5 py-[18px]"
          >
            <span className="text-xs font-medium text-muted-foreground">{t(key)}</span>
            <span className={`font-heading text-[38px] leading-tight font-medium ${tone}`}>
              —
            </span>
            <span className="text-xs text-muted-foreground">{t("noData")}</span>
          </div>
        ))}
      </section>

      <section aria-labelledby="upcoming-heading" className="flex flex-col gap-3">
        <h2 id="upcoming-heading" className="font-heading text-[21px] font-medium">
          {t("upcomingTitle")}
        </h2>
        <EmptyState
          icon={CalendarDays}
          title={t("upcomingTitle")}
          body={t("upcomingEmpty")}
        />
      </section>
    </>
  );
}
