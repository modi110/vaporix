import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

/**
 * Next 16 renamed the `middleware` convention to `proxy`. next-intl's
 * factory is unchanged — it resolves the locale and rewrites localized
 * pathnames onto their shared internal routes.
 */
export default createMiddleware(routing);

export const config = {
  // Everything except API routes, Next internals and static files.
  matcher: "/((?!api|_next|_vercel|.*\..*).*)",
};
