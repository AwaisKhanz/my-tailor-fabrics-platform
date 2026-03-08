import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        ui: ["var(--font-inter)"],
        sans: ["var(--font-inter)"],
        mono: ["var(--font-inter)"],
      },
      spacing: {
        "snow-0": "var(--snow-space-0)",
        "snow-4": "var(--snow-space-4)",
        "snow-8": "var(--snow-space-8)",
        "snow-12": "var(--snow-space-12)",
        "snow-16": "var(--snow-space-16)",
        "snow-20": "var(--snow-space-20)",
        "snow-24": "var(--snow-space-24)",
        "snow-28": "var(--snow-space-28)",
        "snow-32": "var(--snow-space-32)",
        "snow-40": "var(--snow-space-40)",
        "snow-48": "var(--snow-space-48)",
        "snow-80": "var(--snow-space-80)",
      },
      fontSize: {
        "snow-12": ["var(--snow-text-12)", { lineHeight: "var(--snow-leading-12)" }],
        "snow-14": ["var(--snow-text-14)", { lineHeight: "var(--snow-leading-14)" }],
        "snow-16": ["var(--snow-text-16)", { lineHeight: "var(--snow-leading-16)" }],
        "snow-18": ["var(--snow-text-18)", { lineHeight: "var(--snow-leading-18)" }],
        "snow-24": ["var(--snow-text-24)", { lineHeight: "var(--snow-leading-24)" }],
        "snow-32": ["var(--snow-text-32)", { lineHeight: "var(--snow-leading-32)" }],
        "snow-48": ["var(--snow-text-48)", { lineHeight: "var(--snow-leading-48)" }],
        "snow-64": ["var(--snow-text-64)", { lineHeight: "var(--snow-leading-64)" }],
      },
      colors: {
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        border: "hsl(var(--border) / <alpha-value>)",
        input: "hsl(var(--input) / <alpha-value>)",
        ring: "hsl(var(--ring) / <alpha-value>)",
        card: {
          DEFAULT: "hsl(var(--card) / <alpha-value>)",
          foreground: "hsl(var(--card-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "hsl(var(--popover) / <alpha-value>)",
          foreground: "hsl(var(--popover-foreground) / <alpha-value>)",
        },
        primary: {
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
          foreground: "hsl(var(--secondary-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted) / <alpha-value>)",
          foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "hsl(var(--accent) / <alpha-value>)",
          foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        info: {
          DEFAULT: "hsl(var(--info) / <alpha-value>)",
          foreground: "hsl(var(--info-foreground) / <alpha-value>)",
        },
        success: {
          DEFAULT: "hsl(var(--success) / <alpha-value>)",
          foreground: "hsl(var(--success-foreground) / <alpha-value>)",
        },
        warning: {
          DEFAULT: "hsl(var(--warning) / <alpha-value>)",
          foreground: "hsl(var(--warning-foreground) / <alpha-value>)",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar) / <alpha-value>)",
          foreground: "hsl(var(--sidebar-foreground) / <alpha-value>)",
          border: "hsl(var(--sidebar-border) / <alpha-value>)",
        },
        snow: {
          black: "#1c1c1c",
          light: "#f7f9fb",
          blue: "#e3f5ff",
          purple: "#e5ecf6",
          "purple-a": "#95a4fc",
          "purple-b": "#c6c7f8",
          "blue-a": "#a8c5da",
          "blue-b": "#b1e3ff",
          "green-a": "#a1e3cb",
          "green-b": "#baedbd",
          yellow: "#ffe999",
          red: "#ff4747",
        },
        chart: {
          1: "hsl(var(--chart-1) / <alpha-value>)",
          2: "hsl(var(--chart-2) / <alpha-value>)",
          3: "hsl(var(--chart-3) / <alpha-value>)",
          4: "hsl(var(--chart-4) / <alpha-value>)",
          5: "hsl(var(--chart-5) / <alpha-value>)",
        },
      },
      borderRadius: {
        DEFAULT: "var(--radius)",
        sm: "calc(var(--radius) - 8px)",
        md: "calc(var(--radius) - 4px)",
        lg: "var(--radius)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
        "3xl": "calc(var(--radius) + 12px)",
        "snow-4": "var(--snow-radius-4)",
        "snow-8": "var(--snow-radius-8)",
        "snow-12": "var(--snow-radius-12)",
        "snow-16": "var(--snow-radius-16)",
        "snow-20": "var(--snow-radius-20)",
        "snow-24": "var(--snow-radius-24)",
        "snow-28": "var(--snow-radius-28)",
        "snow-32": "var(--snow-radius-32)",
        "snow-40": "var(--snow-radius-40)",
        "snow-48": "var(--snow-radius-48)",
        "snow-80": "var(--snow-radius-80)",
      },
      boxShadow: {
        sm: "var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--shadow-sm)",
        DEFAULT:
          "var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--shadow)",
        focus: "0 0 0 4px hsl(var(--ring) / 0.18)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
