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
        sans: ["var(--font-schibsted)", "var(--font-inter)", "sans-serif"],
        public: ["var(--font-schibsted)", "sans-serif"],
        figtree: ["var(--font-figtree)", "sans-serif"],
        instrument: ["var(--font-instrument-sans)", "sans-serif"],
        schibsted: ["var(--font-schibsted)", "sans-serif"],
        inter: ["var(--font-inter)", "sans-serif"],
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        surface: {
          DEFAULT: "hsl(var(--surface))",
          elevated: "hsl(var(--surface-elevated))",
        },
        appBar: {
          DEFAULT: "hsl(var(--app-bar))",
          foreground: "hsl(var(--app-bar-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar))",
          foreground: "hsl(var(--sidebar-foreground))",
          active: "hsl(var(--sidebar-active))",
          border: "hsl(var(--sidebar-border))",
        },
        text: {
          primary: "hsl(var(--text-primary))",
          secondary: "hsl(var(--text-secondary))",
          disabled: "hsl(var(--text-disabled))",
          inverse: "hsl(var(--text-inverse))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        error: {
          DEFAULT: "hsl(var(--error))",
          foreground: "hsl(var(--error-foreground))",
          muted: "hsl(var(--error-muted))",
        },
        border: "hsl(var(--border))",
        borderStrong: "hsl(var(--border-strong))",
        divider: "hsl(var(--divider))",
        input: "hsl(var(--input))",
        inputSurface: {
          background: "hsl(var(--input-background))",
          text: "hsl(var(--input-text))",
          placeholder: "hsl(var(--input-placeholder))",
          border: "hsl(var(--input-border))",
        },
        ring: "hsl(var(--ring))",
        interaction: {
          hover: "hsl(var(--hover))",
          active: "hsl(var(--active))",
          focus: "hsl(var(--focus-ring))",
        },
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
          "6": "hsl(var(--chart-6))",
          "7": "hsl(var(--chart-7))",
          "8": "hsl(var(--chart-8))",
        },
        brand: {
          dark: "hsl(var(--brand-dark))",
        },
        overlay: {
          DEFAULT: "hsl(var(--overlay))",
          strong: "hsl(var(--overlay-strong))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
          muted: "hsl(var(--success-muted))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
          muted: "hsl(var(--warning-muted))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
          muted: "hsl(var(--info-muted))",
        },
        pending: {
          DEFAULT: "hsl(var(--pending))",
          foreground: "hsl(var(--pending-foreground))",
          muted: "hsl(var(--pending-muted))",
        },
        ready: {
          DEFAULT: "hsl(var(--ready))",
          foreground: "hsl(var(--ready-foreground))",
          muted: "hsl(var(--ready-muted))",
        },
        code: {
          background: "hsl(var(--code-background))",
          text: "hsl(var(--code-text))",
        },
        scrollbar: {
          DEFAULT: "hsl(var(--scrollbar))",
          track: "hsl(var(--scrollbar-track))",
        },
        shadowColor: "hsl(var(--shadow-color))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) * 1.5)",
        "2xl": "calc(var(--radius) * 2)",
        "3xl": "calc(var(--radius) * 3)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
