import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Buttons are thin wrappers over the Uiverse kit in app/uiverse.css:
 *   primary → .uv-btn            (brass, shine sweep)
 *   outline → .uv-btn-outline    (navy outline, fill slides in) — light backgrounds
 *   light   → .uv-btn-ghost-light (white outline)               — navy backgrounds
 *   dark    → solid navy, same geometry as .uv-btn (styled below)
 *   ghost   → text action with the .uv-link underline
 * Sizes map to .uv-btn--sm / .uv-btn--lg so every variant shares one scale.
 */

/*
 * Kit gap (RTL): the kit nudges a trailing icon with `transform`, which wipes a
 * page's `rtl:rotate-180` on hover. Keep lucide ArrowRight icons mirrored under
 * dir="rtl" and nudge them the right way. `svg.lucide.lucide-arrow-right` is
 * specific enough (0,4,1 on hover) to beat the kit's (0,3,1) rule.
 */
const RTL_ARROW =
  "rtl:[&_svg.lucide.lucide-arrow-right]:[transform:rotate(180deg)] motion-safe:rtl:[&:hover_svg.lucide.lucide-arrow-right]:[transform:translateX(-3px)_rotate(180deg)]";

/** Shared icon sizing for the non-kit variants (mirrors `.uv-btn svg`). */
const ICONS = "[&_svg]:h-[1.1em] [&_svg]:w-[1.1em] [&_svg]:shrink-0";

/** Trailing-icon nudge for the non-kit variants (the kit does this for its own). */
const NUDGE =
  "motion-safe:[&>svg:last-child]:transition-transform motion-safe:[&>svg:last-child]:duration-300 motion-safe:[&:hover>svg:last-child]:translate-x-[3px]";

const DISABLED =
  "disabled:pointer-events-none disabled:opacity-[0.55] aria-disabled:pointer-events-none aria-disabled:opacity-[0.55] aria-busy:pointer-events-none aria-busy:cursor-progress";

/** Solid navy, drawn to the exact geometry and type of `.uv-btn`. */
const DARK = cn(
  "relative isolate inline-flex min-h-[44px] items-center justify-center gap-[0.6em] overflow-hidden",
  "rounded-[6px] border border-navy bg-navy px-[1.35rem] py-[0.7rem]",
  "text-center text-[15px] font-semibold leading-[1.2] tracking-[0.01em] text-white no-underline",
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_1px_2px_rgba(5,22,36,0.12)]",
  "hover:bg-navy-soft hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_8px_20px_-8px_rgba(5,22,36,0.55)] active:translate-y-px",
  // brass hairline that draws in along the bottom edge on hover
  "before:pointer-events-none before:absolute before:inset-x-0 before:bottom-0 before:h-[2px] before:origin-left before:scale-x-0 before:bg-brass-light before:content-[''] hover:before:scale-x-100",
  "motion-safe:transition-[background-color,box-shadow,transform] motion-safe:duration-300 motion-safe:before:transition-transform motion-safe:before:duration-500",
  "focus-visible:shadow-[0_0_0_2px_#FBFAF7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy",
  ICONS,
  NUDGE
);

/** Text action: inherits colour, brass underline grows on hover/focus. */
const GHOST = cn(
  "uv-link inline-flex items-center gap-[0.5em] font-semibold leading-[1.3]",
  ICONS,
  NUDGE
);

const KIT_VARIANTS = ["primary", "outline", "light", "dark"] as const;

const buttonVariants = cva(cn(RTL_ARROW, DISABLED), {
  variants: {
    variant: {
      /** Brass with navy text — the main call to action, on light or dark. */
      primary: "uv-btn",
      /** Solid navy — secondary action on light backgrounds. */
      dark: DARK,
      /** Navy outline, fill slides in — light backgrounds. */
      outline: "uv-btn-outline",
      /** White outline — dark backgrounds. */
      light: "uv-btn-ghost-light",
      /** Text-link style action. */
      ghost: GHOST,
    },
    size: {
      default: "",
      sm: "",
      lg: "",
      icon: "",
    },
  },
  compoundVariants: [
    { variant: [...KIT_VARIANTS], size: "sm", class: "uv-btn--sm" },
    { variant: [...KIT_VARIANTS], size: "lg", class: "uv-btn--lg" },
    // Square: kit padding is overridden, min-height (44px) sets the height.
    { variant: [...KIT_VARIANTS], size: "icon", class: "aspect-square w-11 !p-0" },
    // Ghost font size lives here (not in GHOST) so the exported, un-merged
    // buttonVariants() string never carries two font sizes.
    { variant: "ghost", size: "default", class: "text-[15px]" },
    { variant: "ghost", size: "sm", class: "text-sm" },
    { variant: "ghost", size: "lg", class: "text-base" },
    { variant: "ghost", size: "icon", class: "h-11 w-11 justify-center text-[15px] !bg-none !p-0" },
  ],
  defaultVariants: { variant: "primary", size: "default" },
});

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  /**
   * Busy state: sets aria-busy (the kit blocks pointer input), swallows clicks
   * and implicit form submits, and shows the kit's small porthole loader before
   * the label. The button stays focusable and full-colour, so keyboard and
   * screen-reader users keep their place. With `asChild` only aria-busy is set.
   */
  loading?: boolean;
}

/** While busy: ignore clicks and the implicit submit a form fires on Enter. */
const swallow = (e: React.MouseEvent<HTMLButtonElement>) => e.preventDefault();

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, asChild = false, loading = false, children, onClick, ...props },
    ref
  ) => {
    const classes = cn(buttonVariants({ variant, size, className }));

    if (asChild) {
      return (
        <Slot
          className={classes}
          ref={ref}
          onClick={onClick}
          {...props}
          {...(loading ? { "aria-busy": true } : {})}
        >
          {children}
        </Slot>
      );
    }

    const onDark = variant === "dark" || variant === "light";
    return (
      <button
        className={classes}
        ref={ref}
        {...props}
        aria-busy={loading || props["aria-busy"] || undefined}
        // Only hand a handler to the DOM when there is one: this module also
        // renders inside Server Components, which cannot pass functions.
        onClick={loading ? swallow : onClick}
      >
        {loading && (
          <span
            className={cn("uv-loader uv-loader--sm", onDark && "uv-loader--on-dark")}
            aria-hidden="true"
          />
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
