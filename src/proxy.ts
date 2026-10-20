import { NextResponse, type NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { isPublicPath, splitLocale } from "./lib/auth-routes";
import { refreshSession } from "./lib/supabase/proxy";
import { routing } from "./i18n/routing";

const intl = createIntlMiddleware(routing);

export default async function proxy(request: NextRequest) {
  const response = intl(request);

  // next-intl is redirecting (e.g. "/" → "/en/dashboard"); let that happen first.
  if (response.headers.has("location")) return response;

  const userId = await refreshSession(request, response);
  const { locale, path } = splitLocale(request.nextUrl.pathname);
  const prefix = `/${locale ?? routing.defaultLocale}`;

  if (!userId && !isPublicPath(path)) {
    const login = new URL(`${prefix}/login`, request.url);
    login.searchParams.set("next", request.nextUrl.pathname);
    return withCookies(NextResponse.redirect(login), response);
  }

  if (userId && isPublicPath(path) && path !== "/forgot-password") {
    return withCookies(NextResponse.redirect(new URL(`${prefix}/dashboard`, request.url)), response);
  }

  return response;
}

/** Carries refreshed session cookies over to a redirect response. */
function withCookies(target: NextResponse, source: NextResponse) {
  for (const cookie of source.cookies.getAll()) target.cookies.set(cookie);
  return target;
}

export const config = {
  // Skip API routes, the auth callback, Next.js internals and any path with a file extension.
  matcher: "/((?!api/|auth/|trpc|_next|_vercel|.*\\..*).*)",
};
