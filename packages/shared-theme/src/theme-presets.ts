export const THEME_PRESET_IDS = [
  "google-ai-studio-v2",
  "console-minimalist-xai",
] as const;

export type ThemePresetId = (typeof THEME_PRESET_IDS)[number];

export interface ThemePaletteV2 {
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  accent: string;
  accentForeground: string;
  background: string;
  surface: string;
  surfaceElevated: string;
  brandDark: string;

  appBar: string;
  appBarText: string;
  sidebar: string;
  sidebarText: string;
  sidebarActive: string;
  sidebarBorder: string;

  textPrimary: string;
  textSecondary: string;
  textDisabled: string;
  textInverse: string;

  border: string;
  borderStrong: string;
  divider: string;

  hover: string;
  active: string;
  focusRing: string;
  overlay: string;
  overlayStrong: string;

  inputBackground: string;
  inputText: string;
  inputPlaceholder: string;
  inputBorder: string;

  success: string;
  successForeground: string;
  warning: string;
  warningForeground: string;
  error: string;
  errorForeground: string;
  info: string;
  infoForeground: string;
  pending: string;
  pendingForeground: string;
  ready: string;
  readyForeground: string;

  successMuted: string;
  warningMuted: string;
  errorMuted: string;
  infoMuted: string;
  pendingMuted: string;
  readyMuted: string;

  codeBackground: string;
  codeText: string;

  scrollbar: string;
  scrollbarTrack: string;
  shadowColor: string;

  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  chart5: string;
  chart6: string;
  chart7: string;
  chart8: string;
}

export type ThemePalette = ThemePaletteV2;

export interface ThemePreset {
  id: any;
  label: string;
  description: string;
  palette: {
    light: ThemePaletteV2;
    dark: ThemePaletteV2;
  };
}

export const THEME_PRESET_STORAGE_KEY = "tbms_theme_preset";
export const DEFAULT_THEME_PRESET: ThemePresetId = "google-ai-studio-v2";

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "polar-authority",
    label: "Polar Authority",
    description:
      "True white / true black authority system. Strict monochrome structure with controlled accent usage.",

    palette: {
      light: {
        primary: "#111111",
        primaryForeground: "#FFFFFF",

        secondary: "#4B5563",
        secondaryForeground: "#FFFFFF",

        accent: "#2563EB",
        accentForeground: "#FFFFFF",

        background: "#FFFFFF",
        surface: "#FFFFFF",
        surfaceElevated: "#F6F6F6",
        brandDark: "#000000",

        appBar: "#FFFFFF",
        appBarText: "#111111",

        sidebar: "#FAFAFA",
        sidebarText: "#4B5563",
        sidebarActive: "#F0F0F0",
        sidebarBorder: "#E5E5E5",

        textPrimary: "#111111",
        textSecondary: "#525252",
        textDisabled: "#A3A3A3",
        textInverse: "#FFFFFF",

        border: "#E5E5E5",
        borderStrong: "#D4D4D4",
        divider: "#EFEFEF",

        hover: "#F5F5F5",
        active: "#EAEAEA",
        focusRing: "#2563EB",

        overlay: "rgba(0,0,0,0.35)",
        overlayStrong: "rgba(0,0,0,0.6)",

        inputBackground: "#FFFFFF",
        inputText: "#111111",
        inputPlaceholder: "#9CA3AF",
        inputBorder: "#D4D4D4",

        success: "#15803D",
        successForeground: "#FFFFFF",
        warning: "#B45309",
        warningForeground: "#FFFFFF",
        error: "#B91C1C",
        errorForeground: "#FFFFFF",
        info: "#2563EB",
        infoForeground: "#FFFFFF",
        pending: "#6D28D9",
        pendingForeground: "#FFFFFF",
        ready: "#047857",
        readyForeground: "#FFFFFF",

        successMuted: "#ECFDF5",
        warningMuted: "#FFFBEB",
        errorMuted: "#FEF2F2",
        infoMuted: "#EFF6FF",
        pendingMuted: "#F5F3FF",
        readyMuted: "#ECFDF5",

        codeBackground: "#111111",
        codeText: "#F5F5F5",

        scrollbar: "#D4D4D4",
        scrollbarTrack: "#F3F3F3",
        shadowColor: "rgba(0,0,0,0.06)",

        chart1: "#111111",
        chart2: "#2563EB",
        chart3: "#15803D",
        chart4: "#B91C1C",
        chart5: "#B45309",
        chart6: "#6D28D9",
        chart7: "#0EA5E9",
        chart8: "#6B7280",
      },

      dark: {
        primary: "#FFFFFF",
        primaryForeground: "#000000",

        secondary: "#A3A3A3",
        secondaryForeground: "#000000",

        accent: "#3B82F6",
        accentForeground: "#FFFFFF",

        background: "#000000",
        surface: "#0F0F0F",
        surfaceElevated: "#1A1A1A",
        brandDark: "#000000",

        appBar: "#0F0F0F",
        appBarText: "#FFFFFF",

        sidebar: "#0A0A0A",
        sidebarText: "#B3B3B3",
        sidebarActive: "#1A1A1A",
        sidebarBorder: "#1F1F1F",

        textPrimary: "#FFFFFF",
        textSecondary: "#B3B3B3",
        textDisabled: "#666666",
        textInverse: "#000000",

        border: "#1F1F1F",
        borderStrong: "#2A2A2A",
        divider: "#1A1A1A",

        hover: "#141414",
        active: "#1F1F1F",
        focusRing: "#3B82F6",

        overlay: "rgba(0,0,0,0.6)",
        overlayStrong: "rgba(0,0,0,0.85)",

        inputBackground: "#141414",
        inputText: "#FFFFFF",
        inputPlaceholder: "#6B7280",
        inputBorder: "#2A2A2A",

        success: "#22C55E",
        successForeground: "#000000",
        warning: "#F59E0B",
        warningForeground: "#000000",
        error: "#EF4444",
        errorForeground: "#FFFFFF",
        info: "#3B82F6",
        infoForeground: "#FFFFFF",
        pending: "#A78BFA",
        pendingForeground: "#000000",
        ready: "#10B981",
        readyForeground: "#000000",

        successMuted: "#052E16",
        warningMuted: "#422006",
        errorMuted: "#450A0A",
        infoMuted: "#172554",
        pendingMuted: "#2E1065",
        readyMuted: "#064E3B",

        codeBackground: "#000000",
        codeText: "#F5F5F5",

        scrollbar: "#2A2A2A",
        scrollbarTrack: "#0F0F0F",
        shadowColor: "rgba(0,0,0,0.7)",

        chart1: "#FFFFFF",
        chart2: "#3B82F6",
        chart3: "#22C55E",
        chart4: "#EF4444",
        chart5: "#F59E0B",
        chart6: "#A78BFA",
        chart7: "#0EA5E9",
        chart8: "#9CA3AF",
      },
    },
  },
];
export function isThemePreset(value: string): value is ThemePresetId {
  return THEME_PRESET_IDS.includes(value as ThemePresetId);
}

export function getThemePreset(presetId: ThemePresetId): ThemePreset {
  return (
    THEME_PRESETS.find((preset) => preset.id === presetId) ?? THEME_PRESETS[0]
  );
}
