import { updateSession } from "@/lib/supabase/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "./i18n/config";

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
});

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/") {
    return NextResponse.redirect(new URL(`/${defaultLocale}`, request.url));
  }

  const locale = pathname.split("/")[1] || defaultLocale;

  const isAdminRoute = pathname.startsWith(`/${locale}/dashboard`);
  const isProfileRoute = pathname.startsWith(`/${locale}/profile`);
  const isAuthRoute =
    pathname.startsWith(`/${locale}/login`) ||
    pathname.startsWith(`/${locale}/signup`);

  // Public pages need no server-side auth; the browser client keeps the session fresh.
  if (!isAdminRoute && !isProfileRoute && !isAuthRoute) {
    return intlMiddleware(request);
  }

  const { userId, getRole, supabaseResponse } = await updateSession(request);

  if (isAuthRoute && userId) {
    const redirectPath =
      (await getRole()) === "admin" ? `/${locale}/dashboard` : `/${locale}/profile`;
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  if (isProfileRoute && !userId) {
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }

  if (isAdminRoute && (await getRole()) !== "admin") {
    const redirectPath = userId ? `/${locale}/profile` : `/${locale}/login`;
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  const intlResponse = intlMiddleware(request);

  if (intlResponse) {
    intlResponse.headers.forEach((value, key) => {
      supabaseResponse.headers.set(key, value);
    });
  }

  return supabaseResponse;
}

// Public localized pages (home, shop, product, contact) skip middleware entirely so the
// CDN can serve their cached HTML directly; only auth-gated pages and unprefixed paths run it.
export const config = {
  matcher: [
    "/",
    "/(en|ka)/(dashboard|profile|login|signup)/:path*",
    "/((?!api|_next|favicon.ico|en(?:/|$)|ka(?:/|$)|.*\\..*).*)",
  ],
};
