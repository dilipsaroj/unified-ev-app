import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "var(--color-brand-50)",
          500: "var(--color-brand-500)",
          600: "var(--color-brand-600)",
          900: "var(--color-brand-900)",
        },
        neutral: {
          bg: "var(--color-bg)",
          surface: "var(--color-surface)",
          "surface-2": "var(--color-surface-2)",
          "surface-3": "var(--color-surface-3)",
          border: "var(--color-border)",
          ink: "var(--color-ink)",
          "ink-2": "var(--color-ink-2)",
          "ink-3": "var(--color-ink-3)",
          "ink-4": "var(--color-ink-4)",
        },
        session: {
          bg: "var(--color-session-bg)",
          surface: "var(--color-session-surface)",
          ink: "var(--color-session-ink)",
          accent: "var(--color-session-accent)",
        },
        tier: {
          green: "var(--color-tier-green)",
          amber: "var(--color-tier-amber)",
          red: "var(--color-tier-red)",
          unknown: "var(--color-tier-unknown)",
        },
        semantic: {
          success: "var(--color-success)",
          warning: "var(--color-warning)",
          danger: "var(--color-danger)",
          info: "var(--color-info)",
        },
        cpo: {
          "tata-power": "#1B4B96",
          "jio-bp": "#00A550",
          statiq: "#7C3AED",
          hpcl: "#E31E24",
          iocl: "#F58220",
          bpcl: "#FFCB05",
        },
      },
      spacing: {
        "1": "4px",
        "2": "8px",
        "3": "12px",
        "4": "16px",
        "5": "20px",
        "6": "24px",
        "8": "32px",
        "10": "40px",
        "12": "48px",
        "16": "64px",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
        pill: "var(--radius-pill)",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        "glow-brand": "var(--shadow-glow-brand)",
      },
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      fontSize: {
        "display-lg": ["40px", { lineHeight: "44px", fontWeight: "700" }],
        display: ["32px", { lineHeight: "36px", fontWeight: "700" }],
        h1: ["24px", { lineHeight: "30px", fontWeight: "600" }],
        h2: ["20px", { lineHeight: "26px", fontWeight: "600" }],
        h3: ["16px", { lineHeight: "22px", fontWeight: "600" }],
        body: ["15px", { lineHeight: "22px", fontWeight: "400" }],
        sm: ["13px", { lineHeight: "18px", fontWeight: "400" }],
        xs: ["11px", { lineHeight: "14px", fontWeight: "500" }],
        cta: ["15px", { lineHeight: "20px", fontWeight: "600" }],
      },
    },
  },
  plugins: [],
};

export default config;
