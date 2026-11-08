/**
 * The two js-yaml functions the blog uses (js-yaml ships without types; it is
 * installed with @keystatic/core, which reads and writes post frontmatter
 * with the same `load` and `dump`).
 */
declare module "js-yaml" {
  export function load(input: string, options?: Record<string, unknown>): unknown;
  export function dump(value: unknown, options?: Record<string, unknown>): string;
}
