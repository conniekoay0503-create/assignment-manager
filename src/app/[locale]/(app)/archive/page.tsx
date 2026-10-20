import { Archive } from "lucide-react";
import { SectionPage } from "@/components/section-page";
import { resolveLocale } from "@/i18n/locale-param";

export default async function Page({ params }: PageProps<"/[locale]/archive">) {
  const locale = await resolveLocale(params);
  return <SectionPage locale={locale} section="archive" icon={Archive} />;
}
