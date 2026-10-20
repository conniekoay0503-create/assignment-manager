import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { DEFAULT_TIME_ZONE, routing } from "./routing";

export default getRequestConfig(async ({ locale: explicit, requestLocale }) => {
  // Prefer an explicitly passed locale so prerendering never has to read request headers.
  const requested = explicit ?? (await requestLocale);
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    timeZone: DEFAULT_TIME_ZONE,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
