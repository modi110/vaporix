import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

/**
 * Next 16 renamed the `middleware` convention to `proxy`. next-intl's factory
 * is unchanged — it resolves the locale and rewrites localized pathnames
 * (/es/nosotros) onto their shared internal routes (/es/about).
 */
export default createMiddleware(routing);

export const config = {
  matcher: [
    // the root, so locale detection can redirect
    "/",
    // every locale-prefixed path
    "/(es|en)/:path*",
    // everything else except Next internals, API routes and files with an
    // extension. The dot must stay escaped: "\." in a string literal collapses
    // to ".", which turns this into "match anything" and silently disables
    // the proxy on every route but "/".
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
