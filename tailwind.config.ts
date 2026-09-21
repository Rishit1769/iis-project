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
        bg: {
          DEFAULT: "#0B0D10",
          secondary: "#111419",
          elevated: "#161A20",
          hover: "#1C2028",
        },
        text: {
          DEFAULT: "#F2F4F7",
          secondary: "#9CA3AF",
          muted: "#6B7280",
        },
        border: {
          DEFAULT: "#252A32",
          light: "#1E2330",
        },
        accent: {
          DEFAULT: "#4F7DF3",
          hover: "#638EF7",
          muted: "#4F7DF320",
        },
        success: { DEFAULT: "#22C55E", muted: "#22C55E20" },
        warning: { DEFAULT: "#F59E0B", muted: "#F59E0B20" },
        error: { DEFAULT: "#EF4444", muted: "#EF444420" },
      },
      fontFamily: {
        sans: [
          "Inter",
          "Geist",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "SF Mono",
          "Fira Code",
          "monospace",
        ],
      },
      borderRadius: {
        sm: "6px",
        DEFAULT: "8px",
        md: "8px",
        lg: "10px",
        xl: "12px",
      },
      fontSize: {
        "2xs": ["11px", { lineHeight: "16px" }],
      },
      boxShadow: {
        sm: "0 1px 2px rgba(0,0,0,0.3)",
        DEFAULT: "0 2px 8px rgba(0,0,0,0.3)",
        lg: "0 4px 16px rgba(0,0,0,0.4)",
      },
    },
  },
  plugins: [],
};
export default config;
