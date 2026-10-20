"use client";

import { NextIntlClientProvider, type AbstractIntlMessages } from "next-intl";

/**
 * Client-side provider fed explicitly by the locale layout. The server wrapper that
 * next-intl exports reads request data, which would block static prerendering.
 */
export function IntlProvider({
  locale,
  messages,
  timeZone,
  children,
}: {
  locale: string;
  messages: AbstractIntlMessages;
  timeZone: string;
  children: React.ReactNode;
}) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone={timeZone}>
      {children}
    </NextIntlClientProvider>
  );
}
