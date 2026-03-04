export const THEME_PRESET_IDS = [
  "heritage-craft",
  "executive-slate",
  "sandstone-executive",
  "steel-monochrome",
  "modern-minimal",
  "royal-atelier",
  "executive-graphite",
  "nordic-slate",
  "crimson-authority",
  "champagne-pro",
  "noir-gold"
] as const;

export type ThemePresetId = (typeof THEME_PRESET_IDS)[number];

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
  info: string;
  pending: string;
  ready: string;
  brandDark: string;
  overlay: string;
  overlayStrong: string;
  border: string;
  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  chart5: string;
  chart6: string;
  chart7: string;
  chart8: string;
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
    description: "Traditional tailoring warmth with confident handcrafted tones.",
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
        info: "#5D4037",
        pending: "#E65100",
        ready: "#F9A825",
        brandDark: "#3E2723",
        overlay: "rgba(44,24,16,0.4)",
        overlayStrong: "rgba(44,24,16,0.8)",
        border: "#D7CCC8",
        chart1: "#8B4513",
        chart2: "#C41E3A",
        chart3: "#2E7D32",
        chart4: "#D4A574",
        chart5: "#5D4037",
        chart6: "#F57C00",
        chart7: "#3E2723",
        chart8: "#A1887F"
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
        info: "#BCAAA4",
        pending: "#FF9800",
        ready: "#FFEB3B",
        brandDark: "#000000",
        overlay: "rgba(0,0,0,0.6)",
        overlayStrong: "rgba(0,0,0,0.9)",
        border: "#5D4037",
        chart1: "#D4A574",
        chart2: "#FF6B6B",
        chart3: "#4CAF50",
        chart4: "#8B4513",
        chart5: "#BCAAA4",
        chart6: "#FFB74D",
        chart7: "#8D6E63",
        chart8: "#D7CCC8"
      }
    }
  },
  {
    id: "executive-slate",
    label: "Executive Slate",
    description: "Serious corporate aesthetic using deep charcoals and precision blues.",
    palette: {
      light: {
        primary: "#334155",
        secondary: "#64748B",
        accent: "#2563EB",
        background: "#F1F5F9",
        surface: "#FFFFFF",
        textPrimary: "#0F172A",
        textSecondary: "#475569",
        success: "#15803D",
        warning: "#B45309",
        error: "#991B1B",
        info: "#1D4ED8",
        pending: "#C2410C",
        ready: "#4D7C0F",
        brandDark: "#0F172A",
        overlay: "rgba(15,23,42,0.4)",
        overlayStrong: "rgba(15,23,42,0.8)",
        border: "#CBD5E1",
        chart1: "#334155",
        chart2: "#2563EB",
        chart3: "#15803D",
        chart4: "#B45309",
        chart5: "#6366F1",
        chart6: "#0F172A",
        chart7: "#0891B2",
        chart8: "#94A3B8"
      },
      dark: {
        primary: "#94A3B8",
        secondary: "#475569",
        accent: "#60A5FA",
        background: "#0F172A",
        surface: "#1E293B",
        textPrimary: "#F8FAFC",
        textSecondary: "#94A3B8",
        success: "#4ADE80",
        warning: "#FBBF24",
        error: "#F87171",
        info: "#38BDF8",
        pending: "#FB923C",
        ready: "#A3E635",
        brandDark: "#000000",
        overlay: "rgba(0,0,0,0.6)",
        overlayStrong: "rgba(0,0,0,0.9)",
        border: "#334155",
        chart1: "#94A3B8",
        chart2: "#60A5FA",
        chart3: "#4ADE80",
        chart4: "#FBBF24",
        chart5: "#818CF8",
        chart6: "#F1F5F9",
        chart7: "#22D3EE",
        chart8: "#475569"
      }
    }
  },
  {
    id: "sandstone-executive",
    label: "Sandstone Executive",
    description: "Neutral, architectural tones for a premium consulting aesthetic.",
    palette: {
      light: {
        primary: "#45413E",
        secondary: "#78716C",
        accent: "#7C2D12",
        background: "#F5F5F4",
        surface: "#FFFFFF",
        textPrimary: "#1C1917",
        textSecondary: "#57534E",
        success: "#166534",
        warning: "#92400E",
        error: "#991B1B",
        info: "#075985",
        pending: "#7C2D12",
        ready: "#3F6212",
        brandDark: "#1C1917",
        overlay: "rgba(28,25,23,0.4)",
        overlayStrong: "rgba(28,25,23,0.8)",
        border: "#E7E5E4",
        chart1: "#45413E",
        chart2: "#7C2D12",
        chart3: "#166534",
        chart4: "#075985",
        chart5: "#78716C",
        chart6: "#A8A29E",
        chart7: "#92400E",
        chart8: "#D6D3D1"
      },
      dark: {
        primary: "#D6D3D1",
        secondary: "#A8A29E",
        accent: "#FB923C",
        background: "#1C1917",
        surface: "#292524",
        textPrimary: "#FAFAF9",
        textSecondary: "#D6D3D1",
        success: "#4ADE80",
        warning: "#FBBF24",
        error: "#F87171",
        info: "#38BDF8",
        pending: "#F97316",
        ready: "#A3E635",
        brandDark: "#000000",
        overlay: "rgba(0,0,0,0.7)",
        overlayStrong: "rgba(0,0,0,0.9)",
        border: "#44403C",
        chart1: "#D6D3D1",
        chart2: "#FB923C",
        chart3: "#4ADE80",
        chart4: "#38BDF8",
        chart5: "#A8A29E",
        chart6: "#57534E",
        chart7: "#F59E0B",
        chart8: "#292524"
      }
    }
  },
  {
    id: "steel-monochrome",
    label: "Steel Monochrome",
    description: "Zero-distraction professional focus with high legibility.",
    palette: {
      light: {
        primary: "#18181B",
        secondary: "#3F3F46",
        accent: "#000000",
        background: "#FFFFFF",
        surface: "#FFFFFF",
        textPrimary: "#09090B",
        textSecondary: "#52525B",
        success: "#166534",
        warning: "#92400E",
        error: "#991B1B",
        info: "#2563EB",
        pending: "#71717A",
        ready: "#18181B",
        brandDark: "#000000",
        overlay: "rgba(0,0,0,0.4)",
        overlayStrong: "rgba(0,0,0,0.8)",
        border: "#E4E4E7",
        chart1: "#18181B",
        chart2: "#52525B",
        chart3: "#71717A",
        chart4: "#A1A1AA",
        chart5: "#D4D4D8",
        chart6: "#27272A",
        chart7: "#3F3F46",
        chart8: "#09090B"
      },
      dark: {
        primary: "#FAFAFA",
        secondary: "#A1A1AA",
        accent: "#FFFFFF",
        background: "#09090B",
        surface: "#18181B",
        textPrimary: "#FAFAFA",
        textSecondary: "#A1A1AA",
        success: "#4ADE80",
        warning: "#FACC15",
        error: "#F87171",
        info: "#60A5FA",
        pending: "#52525B",
        ready: "#FFFFFF",
        brandDark: "#000000",
        overlay: "rgba(0,0,0,0.7)",
        overlayStrong: "rgba(0,0,0,0.95)",
        border: "#27272A",
        chart1: "#FAFAFA",
        chart2: "#D4D4D8",
        chart3: "#A1A1AA",
        chart4: "#71717A",
        chart5: "#52525B",
        chart6: "#3F3F46",
        chart7: "#27272A",
        chart8: "#18181B"
      }
    }
  },
  {
    id: "modern-minimal",
    label: "Modern Minimal",
    description: "Efficient SaaS clarity with balanced neutral and status contrast.",
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
        info: "#3B82F6",
        pending: "#F97316",
        ready: "#84CC16",
        brandDark: "#020617",
        overlay: "rgba(15,23,42,0.4)",
        overlayStrong: "rgba(15,23,42,0.8)",
        border: "#E2E8F0",
        chart1: "#3B82F6",
        chart2: "#10B981",
        chart3: "#F59E0B",
        chart4: "#EF4444",
        chart5: "#8B5CF6",
        chart6: "#EC4899",
        chart7: "#06B6D4",
        chart8: "#64748B"
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
        info: "#60A5FA",
        pending: "#FB923C",
        ready: "#A3E635",
        brandDark: "#000000",
        overlay: "rgba(0,0,0,0.6)",
        overlayStrong: "rgba(0,0,0,0.9)",
        border: "#334155",
        chart1: "#60A5FA",
        chart2: "#34D399",
        chart3: "#FBBF24",
        chart4: "#F87171",
        chart5: "#A78BFA",
        chart6: "#F472B6",
        chart7: "#22D3EE",
        chart8: "#94A3B8"
      }
    }
  },
  {
    id: "royal-atelier",
    label: "Royal Atelier",
    description: "Luxury tailoring language with navy depth and gold authority.",
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
        info: "#4B5563",
        pending: "#B45309",
        ready: "#D4AF37",
        brandDark: "#0F0F1A",
        overlay: "rgba(26,26,46,0.5)",
        overlayStrong: "rgba(26,26,46,0.9)",
        border: "#E5E7EB",
        chart1: "#1A1A2E",
        chart2: "#D4AF37",
        chart3: "#722F37",
        chart4: "#059669",
        chart5: "#7C3AED",
        chart6: "#DB2777",
        chart7: "#0891B2",
        chart8: "#9CA3AF"
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
        info: "#D1D5DB",
        pending: "#F97316",
        ready: "#FDE047",
        brandDark: "#000000",
        overlay: "rgba(0,0,0,0.7)",
        overlayStrong: "rgba(0,0,0,0.95)",
        border: "#374151",
        chart1: "#D4AF37",
        chart2: "#1A1A2E",
        chart3: "#9B2335",
        chart4: "#10B981",
        chart5: "#A78BFA",
        chart6: "#F472B6",
        chart7: "#22D3EE",
        chart8: "#D1D5DB"
      }
    }
  },
  {
    id: "executive-graphite",
    label: "Executive Graphite",
    description: "High-contrast professional grayscale with decisive blue focus.",
    palette: {
      light: {
        primary: "#334155",
        secondary: "#64748B",
        accent: "#2563EB",
        background: "#F1F5F9",
        surface: "#FFFFFF",
        textPrimary: "#0F172A",
        textSecondary: "#475569",
        success: "#15803D",
        warning: "#B45309",
        error: "#BE123C",
        info: "#0369A1",
        pending: "#D97706",
        ready: "#16A34A",
        brandDark: "#1E293B",
        overlay: "rgba(15,23,42,0.4)",
        overlayStrong: "rgba(15,23,42,0.9)",
        border: "#CBD5E1",
        chart1: "#334155",
        chart2: "#2563EB",
        chart3: "#64748B",
        chart4: "#15803D",
        chart5: "#0369A1",
        chart6: "#BE123C",
        chart7: "#475569",
        chart8: "#94A3B8"
      },
      dark: {
        primary: "#F8FAFC",
        secondary: "#94A3B8",
        accent: "#3B82F6",
        background: "#0F172A",
        surface: "#1E293B",
        textPrimary: "#F1F5F9",
        textSecondary: "#94A3B8",
        success: "#4ADE80",
        warning: "#FBBF24",
        error: "#FB7185",
        info: "#60A5FA",
        pending: "#FB923C",
        ready: "#4ADE80",
        brandDark: "#000000",
        overlay: "rgba(0,0,0,0.7)",
        overlayStrong: "rgba(0,0,0,0.95)",
        border: "#334155",
        chart1: "#F8FAFC",
        chart2: "#3B82F6",
        chart3: "#94A3B8",
        chart4: "#4ADE80",
        chart5: "#60A5FA",
        chart6: "#FB7185",
        chart7: "#475569",
        chart8: "#334155"
      }
    }
  },
  {
    id: "nordic-slate",
    label: "Nordic Slate",
    description: "Cool, balanced tones for a modern and precise engineering feel.",
    palette: {
      light: {
        primary: "#475569",
        secondary: "#64748B",
        accent: "#0891B2",
        background: "#F8FAFC",
        surface: "#FFFFFF",
        textPrimary: "#1E293B",
        textSecondary: "#64748B",
        success: "#059669",
        warning: "#CA8A04",
        error: "#E11D48",
        info: "#2563EB",
        pending: "#EA580C",
        ready: "#16A34A",
        brandDark: "#334155",
        overlay: "rgba(71,85,105,0.4)",
        overlayStrong: "rgba(51,65,85,0.9)",
        border: "#E2E8F0",
        chart1: "#475569",
        chart2: "#0891B2",
        chart3: "#059669",
        chart4: "#2563EB",
        chart5: "#7C3AED",
        chart6: "#E11D48",
        chart7: "#0D9488",
        chart8: "#94A3B8"
      },
      dark: {
        primary: "#CBD5E1",
        secondary: "#94A3B8",
        accent: "#22D3EE",
        background: "#1E293B",
        surface: "#334155",
        textPrimary: "#F8FAFC",
        textSecondary: "#94A3B8",
        success: "#34D399",
        warning: "#FBBF24",
        error: "#FB7185",
        info: "#60A5FA",
        pending: "#FB923C",
        ready: "#4ADE80",
        brandDark: "#000000",
        overlay: "rgba(0,0,0,0.6)",
        overlayStrong: "rgba(0,0,0,0.9)",
        border: "#475569",
        chart1: "#CBD5E1",
        chart2: "#22D3EE",
        chart3: "#34D399",
        chart4: "#60A5FA",
        chart5: "#A78BFA",
        chart6: "#F472B6",
        chart7: "#2DD4BF",
        chart8: "#94A3B8"
      }
    }
  },
  {
    id: "crimson-authority",
    label: "Crimson Authority",
    description: "A commanding palette using deep rubies and charcoal for high-end polish.",
    palette: {
      light: {
        primary: "#7F1D1D",
        secondary: "#991B1B",
        accent: "#1E293B",
        background: "#FFF1F2",
        surface: "#FFFFFF",
        textPrimary: "#450A0A",
        textSecondary: "#7F1D1D",
        success: "#166534",
        warning: "#854D0E",
        error: "#991B1B",
        info: "#1E40AF",
        pending: "#9A3412",
        ready: "#15803D",
        brandDark: "#450A0A",
        overlay: "rgba(127,29,29,0.3)",
        overlayStrong: "rgba(69,10,10,0.9)",
        border: "#FECDD3",
        chart1: "#7F1D1D",
        chart2: "#1E293B",
        chart3: "#166534",
        chart4: "#1E40AF",
        chart5: "#6D28D9",
        chart6: "#991B1B",
        chart7: "#0F766E",
        chart8: "#4B5563"
      },
      dark: {
        primary: "#FCA5A5",
        secondary: "#EF4444",
        accent: "#F8FAFC",
        background: "#450A0A",
        surface: "#7F1D1D",
        textPrimary: "#FFF1F2",
        textSecondary: "#FCA5A5",
        success: "#4ADE80",
        warning: "#FACC15",
        error: "#F87171",
        info: "#60A5FA",
        pending: "#FB923C",
        ready: "#A3E635",
        brandDark: "#000000",
        overlay: "rgba(0,0,0,0.7)",
        overlayStrong: "rgba(0,0,0,0.95)",
        border: "#991B1B",
        chart1: "#FCA5A5",
        chart2: "#F8FAFC",
        chart3: "#4ADE80",
        chart4: "#60A5FA",
        chart5: "#C084FC",
        chart6: "#F87171",
        chart7: "#2DD4BF",
        chart8: "#94A3B8"
      }
    }
  },
  {
    id: "champagne-pro",
    label: "Champagne Professional",
    description: "Sophisticated warm neutrals for a boutique, premium feel.",
    palette: {
      light: {
        primary: "#4B433F",
        secondary: "#8C7E74",
        accent: "#AF8C72",
        background: "#F9F7F5",
        surface: "#FFFFFF",
        textPrimary: "#2D2825",
        textSecondary: "#6B5F58",
        success: "#4F6F52",
        warning: "#A67B5B",
        error: "#8C3333",
        info: "#5B7B8C",
        pending: "#8C5B3F",
        ready: "#6F8C52",
        brandDark: "#2D2825",
        overlay: "rgba(45,40,37,0.4)",
        overlayStrong: "rgba(45,40,37,0.85)",
        border: "#E5E1DD",
        chart1: "#4B433F",
        chart2: "#AF8C72",
        chart3: "#4F6F52",
        chart4: "#5B7B8C",
        chart5: "#8C3333",
        chart6: "#8C7E74",
        chart7: "#A67B5B",
        chart8: "#948E89"
      },
      dark: {
        primary: "#D9C5B2",
        secondary: "#AF8C72",
        accent: "#F2E8DF",
        background: "#1C1A19",
        surface: "#2D2825",
        textPrimary: "#F9F7F5",
        textSecondary: "#A89B93",
        success: "#86A689",
        warning: "#D9A073",
        error: "#D97777",
        info: "#93B3C4",
        pending: "#D98C5B",
        ready: "#B3C493",
        brandDark: "#000000",
        overlay: "rgba(0,0,0,0.7)",
        overlayStrong: "rgba(0,0,0,0.95)",
        border: "#4B433F",
        chart1: "#D9C5B2",
        chart2: "#AF8C72",
        chart3: "#86A689",
        chart4: "#93B3C4",
        chart5: "#D97777",
        chart6: "#A89B93",
        chart7: "#D9A073",
        chart8: "#4B433F"
      }
    }
  },
  {
    id: "noir-gold",
    label: "Noir Gold",
    description: "High-contrast executive black with refined champagne gold.",
    palette: {
      light: {
        primary: "#111827",
        secondary: "#AF923C",
        accent: "#AF923C",
        background: "#FFFFFF",
        surface: "#FAFAFA",
        textPrimary: "#111827",
        textSecondary: "#4B5563",
        success: "#065F46",
        warning: "#92400E",
        error: "#991B1B",
        info: "#1F2937",
        pending: "#B45309",
        ready: "#065F46",
        brandDark: "#000000",
        overlay: "rgba(17,24,39,0.5)",
        overlayStrong: "rgba(0,0,0,0.9)",
        border: "#E5E7EB",
        chart1: "#111827",
        chart2: "#AF923C",
        chart3: "#374151",
        chart4: "#4B5563",
        chart5: "#9CA3AF",
        chart6: "#065F46",
        chart7: "#92400E",
        chart8: "#1F2937"
      },
      dark: {
        primary: "#D4AF37",
        secondary: "#111827",
        accent: "#E5C158",
        background: "#000000",
        surface: "#111111",
        textPrimary: "#FFFFFF",
        textSecondary: "#A1A1AA",
        success: "#34D399",
        warning: "#FBBF24",
        error: "#F87171",
        info: "#D4AF37",
        pending: "#FB923C",
        ready: "#34D399",
        brandDark: "#000000",
        overlay: "rgba(0,0,0,0.7)",
        overlayStrong: "rgba(0,0,0,0.95)",
        border: "#262626",
        chart1: "#D4AF37",
        chart2: "#FFFFFF",
        chart3: "#A1A1AA",
        chart4: "#525252",
        chart5: "#FBBF24",
        chart6: "#F87171",
        chart7: "#34D399",
        chart8: "#262626"
      }
    }
  }
]

export function isThemePreset(value: string): value is ThemePresetId {
  return THEME_PRESET_IDS.includes(value as ThemePresetId);
}

export function getThemePreset(presetId: ThemePresetId): ThemePreset {
  return THEME_PRESETS.find((preset) => preset.id === presetId) ?? THEME_PRESETS[0];
}
