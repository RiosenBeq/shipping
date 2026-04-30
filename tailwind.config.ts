import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1320px" },
    },
    extend: {
      colors: {
        // Brand tokens — references the CSS variables defined in globals.css
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
        surface: {
          white: "var(--surface-white)",
          cream: "var(--surface-cream)",
        },
        state: {
          positive: "var(--state-positive)",
          negative: "var(--state-negative)",
        },
        hairline: "var(--hairline)",
        // shadcn-required tokens — mapped to brand
        background: "var(--bg)",
        foreground: "var(--fg)",
        muted: { DEFAULT: "var(--surface-cream)", foreground: "var(--muted)" },
        border: "var(--hairline)",
        input: "var(--hairline)",
        ring: "var(--accent-brass)",
        primary: { DEFAULT: "var(--accent-brass)", foreground: "#ffffff" },
        secondary: { DEFAULT: "var(--surface-cream)", foreground: "var(--fg)" },
        destructive: { DEFAULT: "var(--state-negative)", foreground: "#ffffff" },
        accentUI: { DEFAULT: "var(--accent-brass-lt)", foreground: "var(--ink-deep-petrol)" },
        popover: { DEFAULT: "var(--surface-white)", foreground: "var(--fg)" },
        card: { DEFAULT: "var(--surface-white)", foreground: "var(--fg)" },
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        lg: "8px",
        md: "4px",
        sm: "2px",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [animate],
};

export default config;
