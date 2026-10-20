import { Brand } from "@/components/layout/brand";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Topbar } from "@/components/layout/topbar";
import { resolveLocale } from "@/i18n/locale-param";

export default async function AppLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const locale = await resolveLocale(params);

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 shrink-0 flex-col gap-6 border-r border-sidebar-border bg-sidebar px-3.5 py-5 lg:flex">
        <Brand locale={locale} />
        <SidebarNav />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar locale={locale} />
        <main className="mx-auto flex w-full max-w-[1240px] flex-col gap-6 px-4 py-7 sm:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
