const trim = (p: string) => (p.length > 1 ? p.replace(/\/+$/, "") : p);

/**
 * Whether a plain left click on a link with this `href` leaves the current page for another
 * page of this site: the nav tide line runs only then. Not for other origins, mailto:/tel:,
 * same-page anchors, query-only changes, new tabs or downloads.
 */
export function leavesPage(
  href: string | null,
  here: string,
  opts: { target?: string | null; download?: boolean } = {}
): boolean {
  if (!href || opts.download || (opts.target && opts.target !== "_self")) return false;
  try {
    const from = new URL(here);
    const to = new URL(href, from);
    return to.origin === from.origin && trim(to.pathname) !== trim(from.pathname);
  } catch {
    return false;
  }
}
