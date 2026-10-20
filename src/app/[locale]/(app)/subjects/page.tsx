import { BookOpen } from "lucide-react";
import { SectionPage } from "@/components/section-page";
import { resolveLocale } from "@/i18n/locale-param";

export default async function Page({ params }: PageProps<"/[locale]/subjects">) {
  const locale = await resolveLocale(params);
  return <SectionPage locale={locale} section="subjects" icon={BookOpen} />;
}
