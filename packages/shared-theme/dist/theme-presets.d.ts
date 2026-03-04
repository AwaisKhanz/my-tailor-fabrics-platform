export declare const THEME_PRESET_IDS: readonly ["heritage-craft", "executive-slate", "sandstone-executive", "steel-monochrome", "modern-minimal", "royal-atelier", "executive-graphite", "nordic-slate", "crimson-authority", "champagne-pro", "noir-gold"];
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
export declare const THEME_PRESET_STORAGE_KEY = "tbms_theme_preset";
export declare const DEFAULT_THEME_PRESET: ThemePresetId;
export declare const THEME_PRESETS: ThemePreset[];
export declare function isThemePreset(value: string): value is ThemePresetId;
export declare function getThemePreset(presetId: ThemePresetId): ThemePreset;
