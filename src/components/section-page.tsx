import type { LucideIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { EmptyState } from "./empty-state";
import { PageHeader } from "./page-header";

type Section =
  | "semesters"
  | "subjects"
  | "tasks"
  | "calendar"
  | "grades"
  | "archive"
  | "notifications";

/** Header plus empty state for a section whose data features arrive in a later phase. */
export async function SectionPage({
  locale,
  section,
  icon,
}: {
  locale: Locale;
  section: Section;
  icon: LucideIcon;
}) {
  const t = await getTranslations({ locale, namespace: `Pages.${section}` });
  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      <EmptyState icon={icon} title={t("emptyTitle")} body={t("emptyBody")} />
    </>
  );
}
