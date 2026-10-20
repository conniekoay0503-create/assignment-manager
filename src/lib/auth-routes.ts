import { routing } from "@/i18n/routing";

/** Pages a signed-out visitor may open (paths without the locale prefix). */
export const PUBLIC_PATHS = ["/login", "/signup", "/forgot-password"] as const;

/** Splits "/zh-CN/tasks/1" into { locale: "zh-CN", path: "/tasks/1" }. */
export function splitLocale(pathname: string) {
  const [, first, ...rest] = pathname.split("/");
  const locale = routing.locales.find((l) => l === first);
  if (!locale) return { locale: null, path: pathname };
  return { locale, path: `/${rest.join("/")}`.replace(/\/$/, "") || "/" };
}

export function isPublicPath(path: string) {
  return PUBLIC_PATHS.some((p) => path === p || path.startsWith(`${p}/`));
}
