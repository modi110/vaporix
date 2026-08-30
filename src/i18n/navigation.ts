import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/**
 * Locale-aware replacements for next/link and the navigation hooks.
 * Always import these instead of the ones from `next/navigation`, or
 * localized pathnames silently stop resolving.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
