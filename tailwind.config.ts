import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        muted: "var(--muted)",
        mutedForeground: "var(--mutedForeground)",
        border: "var(--borderColor)",
        borderLight: "var(--borderLight)",
        card: "var(--card)",
        cardForeground: "var(--cardForeground)",
        ring: "var(--ring)",
      },
      fontFamily: {
        display: ['"Playfair Display"', "Georgia", "serif"],
        body: ['"Source Serif 4"', "Georgia", "serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
      borderRadius: {
        none: "0px",
        DEFAULT: "0px",
        sm: "0px",
        md: "0px",
        lg: "0px",
        xl: "0px",
        "2xl": "0px",
        "3xl": "0px",
        full: "0px",
      },
      borderWidth: {
        hairline: "1px",
        thin: "1px",
        medium: "2px",
        thick: "4px",
        ultra: "8px",
      },
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
        "128": "32rem",
      },
      fontSize: {
        "display-sm": ["3.5rem", { lineHeight: "1", letterSpacing: "-0.025em" }],
        "display-md": ["4.5rem", { lineHeight: "1", letterSpacing: "-0.025em" }],
        "display-lg": ["6rem", { lineHeight: "1", letterSpacing: "-0.025em" }],
        "display-xl": ["8rem", { lineHeight: "0.95", letterSpacing: "-0.05em" }],
        "display-2xl": ["10rem", { lineHeight: "0.9", letterSpacing: "-0.05em" }],
      },
      transitionDuration: {
        instant: "100ms",
      },
    },
  },
  plugins: [],
};
export default config;
