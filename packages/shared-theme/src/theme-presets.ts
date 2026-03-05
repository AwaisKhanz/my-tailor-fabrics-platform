export const THEME_PRESET_IDS = ["polar-authority"] as const;

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
  id: ThemePresetId;
  label: string;
  description: string;
  palette: {
    light: ThemePaletteV2;
    dark: ThemePaletteV2;
  };
}

export const THEME_PRESET_STORAGE_KEY = "tbms_theme_preset";
export const DEFAULT_THEME_PRESET: ThemePresetId = "polar-authority";

const POLAR_AUTHORITY_LIGHT: ThemePaletteV2 = {
  primary: "#000000",
  primaryForeground: "#FFFFFF",

  secondary: "#4D4D4D",
  secondaryForeground: "#FFFFFF",

  accent: "#000000",
  accentForeground: "#FFFFFF",

  background: "#F5F5F5",
  surface: "#F5F5F5",
  surfaceElevated: "#FFFFFF",
  brandDark: "#FFFFFF",

  appBar: "#FFFFFF",
  appBarText: "#000000",

  sidebar: "#FFFFFF",
  sidebarText: "#000000",
  sidebarActive: "#E5E5E5",
  sidebarBorder: "#E5E5E5",

  textPrimary: "#000000",
  textSecondary: "#4D4D4D",
  textDisabled: "#999999",
  textInverse: "#FFFFFF",

  border: "#E5E5E5",
  borderStrong: "#D4D4D4",
  divider: "#F0F0F0",

  hover: "#F5F5F5",
  active: "#EAEAEA",
  focusRing: "#000000",

  overlay: "rgba(0,0,0,0.25)",
  overlayStrong: "rgba(0,0,0,0.45)",

  inputBackground: "#FFFFFF",
  inputText: "#000000",
  inputPlaceholder: "#999999",
  inputBorder: "#D4D4D4",

  success: "#166534",
  successForeground: "#FFFFFF",
  warning: "#92400E",
  warningForeground: "#FFFFFF",
  error: "#991B1B",
  errorForeground: "#FFFFFF",
  info: "#2D2D2D",
  infoForeground: "#FFFFFF",
  pending: "#404040",
  pendingForeground: "#FFFFFF",
  ready: "#14532D",
  readyForeground: "#FFFFFF",

  successMuted: "#ECFDF5",
  warningMuted: "#FFFBEB",
  errorMuted: "#FEF2F2",
  infoMuted: "#F5F5F5",
  pendingMuted: "#F5F5F5",
  readyMuted: "#ECFDF5",

  codeBackground: "#000000",
  codeText: "#F5F5F5",

  scrollbar: "#D4D4D4",
  scrollbarTrack: "#F3F3F3",
  shadowColor: "rgba(0,0,0,0.08)",

  chart1: "#000000",
  chart2: "#404040",
  chart3: "#737373",
  chart4: "#A3A3A3",
  chart5: "#D4D4D4",
  chart6: "#166534",
  chart7: "#991B1B",
  chart8: "#92400E",
};

const POLAR_AUTHORITY_DARK: ThemePaletteV2 = {
  primary: "#FFFFFF",
  primaryForeground: "#000000",

  secondary: "#B3B3B3",
  secondaryForeground: "#000000",

  accent: "#FFFFFF",
  accentForeground: "#000000",

  background: "#000000",
  surface: "#000000",
  surfaceElevated: "#181818",
  brandDark: "#000000",

  appBar: "#181818",
  appBarText: "#FFFFFF",

  sidebar: "#181818",
  sidebarText: "#FFFFFF",
  sidebarActive: "#000000",
  sidebarBorder: "#1A1A1A",

  textPrimary: "#FFFFFF",
  textSecondary: "#B3B3B3",
  textDisabled: "#666666",
  textInverse: "#000000",

  border: "#1A1A1A",
  borderStrong: "#262626",
  divider: "#181818",

  hover: "#181818",
  active: "#1A1A1A",
  focusRing: "#FFFFFF",

  overlay: "rgba(0,0,0,0.6)",
  overlayStrong: "rgba(0,0,0,0.85)",

  inputBackground: "#181818",
  inputText: "#FFFFFF",
  inputPlaceholder: "#666666",
  inputBorder: "#262626",

  success: "#22C55E",
  successForeground: "#000000",
  warning: "#F59E0B",
  warningForeground: "#000000",
  error: "#EF4444",
  errorForeground: "#FFFFFF",
  info: "#FFFFFF",
  infoForeground: "#000000",
  pending: "#B3B3B3",
  pendingForeground: "#000000",
  ready: "#10B981",
  readyForeground: "#000000",

  successMuted: "#052E16",
  warningMuted: "#422006",
  errorMuted: "#450A0A",
  infoMuted: "#181818",
  pendingMuted: "#181818",
  readyMuted: "#064E3B",

  codeBackground: "#000000",
  codeText: "#F5F5F5",

  scrollbar: "#262626",
  scrollbarTrack: "#0A0A0A",
  shadowColor: "rgba(0,0,0,0.7)",

  chart1: "#FFFFFF",
  chart2: "#B3B3B3",
  chart3: "#737373",
  chart4: "#525252",
  chart5: "#404040",
  chart6: "#22C55E",
  chart7: "#EF4444",
  chart8: "#F59E0B",
};

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "polar-authority",
    label: "Polar Authority",
    description:
      "Strict white light mode and true black dark mode. Pure contrast system with disciplined neutral structure.",
    palette: {
      light: POLAR_AUTHORITY_LIGHT,
      dark: POLAR_AUTHORITY_DARK,
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
