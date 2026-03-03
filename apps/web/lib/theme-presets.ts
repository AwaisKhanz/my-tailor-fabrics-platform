export type ThemePresetId =
  | "heritage-craft"
  | "modern-minimal"
  | "royal-atelier"
;

export interface ThemePalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  textPrimary: string;
  textSecondary: string;
  success: string;
  warning: string;
  error: string;
  border: string;
}

export interface ThemePreset {
  id: ThemePresetId;
  label: string;
  description: string;
  palette: {
    light: ThemePalette;
    dark: ThemePalette;
  };
}

export const THEME_PRESET_STORAGE_KEY = "tbms_theme_preset";
export const DEFAULT_THEME_PRESET: ThemePresetId = "modern-minimal";

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "heritage-craft",
    label: "Heritage Craft",
    description: "Traditional workshop feel with rich browns and confident contrast.",
    palette: {
      light: {
        primary: "#8B4513",
        secondary: "#D4A574",
        accent: "#C41E3A",
        background: "#FDF8F3",
        surface: "#FFFFFF",
        textPrimary: "#2C1810",
        textSecondary: "#6B4423",
        success: "#2E7D32",
        warning: "#F57C00",
        error: "#C41E3A",
        border: "#E9D9CB",
      },
      dark: {
        primary: "#D4A574",
        secondary: "#8B4513",
        accent: "#FF6B6B",
        background: "#1A120B",
        surface: "#2C1810",
        textPrimary: "#FDF8F3",
        textSecondary: "#A0826D",
        success: "#4CAF50",
        warning: "#FFB74D",
        error: "#FF5252",
        border: "#5A3A23",
      },
    },
  },
  {
    id: "modern-minimal",
    label: "Modern Minimal",
    description: "Tech-forward SaaS style optimized for speed and visual clarity.",
    palette: {
      light: {
        primary: "#0F172A",
        secondary: "#3B82F6",
        accent: "#10B981",
        background: "#F8FAFC",
        surface: "#FFFFFF",
        textPrimary: "#0F172A",
        textSecondary: "#64748B",
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
        border: "#E2E8F0",
      },
      dark: {
        primary: "#60A5FA",
        secondary: "#3B82F6",
        accent: "#34D399",
        background: "#020617",
        surface: "#0F172A",
        textPrimary: "#F8FAFC",
        textSecondary: "#94A3B8",
        success: "#34D399",
        warning: "#FBBF24",
        error: "#F87171",
        border: "#1E293B",
      },
    },
  },
  {
    id: "royal-atelier",
    label: "Royal Atelier",
    description: "Luxury tailoring direction with deep navy, gold, and burgundy accents.",
    palette: {
      light: {
        primary: "#1A1A2E",
        secondary: "#D4AF37",
        accent: "#722F37",
        background: "#FAF9F6",
        surface: "#FFFFFF",
        textPrimary: "#1A1A2E",
        textSecondary: "#6B7280",
        success: "#059669",
        warning: "#D97706",
        error: "#DC2626",
        border: "#E5E7EB",
      },
      dark: {
        primary: "#D4AF37",
        secondary: "#1A1A2E",
        accent: "#9B2335",
        background: "#0D0D15",
        surface: "#1A1A2E",
        textPrimary: "#FAF9F6",
        textSecondary: "#9CA3AF",
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
        border: "#2A2A40",
      },
    },
  },
];

export function isThemePreset(value: string): value is ThemePresetId {
  return THEME_PRESETS.some((preset) => preset.id === value);
}
