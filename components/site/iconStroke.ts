/**
 * The icon stroke scale (lucide units, on its 24px grid). One family, three weights:
 * - `ring`: line icons in the outlined circles and squares on night grounds (facts, services,
 *   contact lines, socials, the rail's buttons): thin, like the references' ring icons;
 * - `inline`: icons beside text on paper and in small controls (1.25 starts to grey out on
 *   sand at 20px);
 * - `cta`: arrows in buttons and links, which have to read at 14–18px.
 * Re-exported by `components/site/home/icons.tsx`; client components import it from here.
 */
export const ICON_STROKE = { ring: 1.25, inline: 1.5, cta: 1.8 } as const;
