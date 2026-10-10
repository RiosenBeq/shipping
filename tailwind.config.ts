import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1.25rem", md: "2rem" },
      screens: { "2xl": "1240px" },
    },
    extend: {
      colors: {
        // Core palette — hex values (not CSS vars) so opacity modifiers like
        // `bg-navy/5` work. Keep in sync with :root in globals.css.
        navy: { DEFAULT: "#0A1F33", deep: "#051624", soft: "#13304A" },
        brass: { DEFAULT: "#B8893A", ink: "#8A6420", light: "#D9B071" },
        sand: "#F3EFE4",
        line: "#E4DDCC",
        slate: "#4A5E6E",
        fog: "#A9B6BF",
        // Legacy tokens still used by the voyage estimator and shadcn primitives
        ink: {
          petrol: "var(--ink-deep-petrol)",
          midnight: "var(--ink-midnight)",
          abyss: "var(--ink-abyss)",
          bone: "var(--ink-bone)",
          slate: "var(--ink-slate)",
          fog: "var(--ink-fog)",
        },
        accent: {
          brass: "var(--accent-brass)",
          "brass-lt": "var(--accent-brass-lt)",
          amber: "var(--accent-amber)",
          teal: "var(--accent-teal)",
          "deep-sea": "var(--accent-deep-sea)",
          foam: "var(--accent-foam)",
          coral: "var(--accent-coral)",
        },
        surface: { white: "var(--surface-white)", cream: "var(--surface-cream)" },
        state: { positive: "#2E7D5F", negative: "#A53A33" },
        hairline: "var(--hairline)",
        background: "#FBFAF7",
        foreground: "#0A1F33",
        muted: { DEFAULT: "var(--sand)", foreground: "var(--slate)" },
        border: "var(--line)",
        input: "var(--line)",
        ring: "var(--brass)",
        popover: { DEFAULT: "#ffffff", foreground: "var(--fg)" },
        card: { DEFAULT: "#ffffff", foreground: "var(--fg)" },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: { lg: "10px", md: "6px", sm: "4px" },
      // One fixed reading measure for the article column (≈68ch of the 17px
      // .lv-prose body). In rem, not ch, so cards, dividers and tag rows set
      // at 16px end on the same edge as the prose.
      maxWidth: { prose: "44rem" },
    },
  },
  plugins: [animate],
};

export default config;
