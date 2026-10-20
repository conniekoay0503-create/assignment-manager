import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import {
  Fraunces,
  IBM_Plex_Mono,
  IBM_Plex_Sans,
  Noto_Sans_SC,
  Noto_Serif_SC,
} from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { IntlProvider } from "@/i18n/intl-provider";
import { DEFAULT_TIME_ZONE, routing } from "@/i18n/routing";
import "../globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

// CJK fonts are large, so they are not preloaded; the browser fetches only the glyphs it needs.
const notoSansSC = Noto_Sans_SC({
  variable: "--font-noto-sans-sc",
  weight: ["400", "500", "700"],
  preload: false,
});

const notoSerifSC = Noto_Serif_SC({
  variable: "--font-noto-serif-sc",
  weight: ["600"],
  preload: false,
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return { title: t("title"), description: t("description") };
}

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);
  const messages = await getMessages({ locale });

  const fontVars = [fraunces, plexSans, plexMono, notoSansSC, notoSerifSC]
    .map((f) => f.variable)
    .join(" ");

  return (
    <html lang={locale} className={`${fontVars} h-full antialiased`}>
      <body className="min-h-full">
        <IntlProvider locale={locale} messages={messages} timeZone={DEFAULT_TIME_ZONE}>
          <TooltipProvider>{children}</TooltipProvider>
        </IntlProvider>
      </body>
    </html>
  );
}
