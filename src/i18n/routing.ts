import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "zh-CN"],
  defaultLocale: "en",
  localePrefix: "always",
});

export type Locale = (typeof routing.locales)[number];

/** Fallback until each user's own time zone is stored in their profile. */
export const DEFAULT_TIME_ZONE = "Asia/Kuala_Lumpur";
