import { CalendarDays } from "lucide-react";
import { SectionPage } from "@/components/section-page";
import { resolveLocale } from "@/i18n/locale-param";

export default async function Page({ params }: PageProps<"/[locale]/calendar">) {
  const locale = await resolveLocale(params);
  return <SectionPage locale={locale} section="calendar" icon={CalendarDays} />;
}
