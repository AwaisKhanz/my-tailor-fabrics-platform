"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { createThemeCssVariables, type ThemeMode } from "@/lib/theme-css";
import {
  DEFAULT_THEME_PRESET,
  getThemePreset,
  isThemePreset,
  THEME_PRESET_STORAGE_KEY,
  type ThemePresetId,
} from "@/lib/theme-presets";

interface ThemePresetContextValue {
  preset: ThemePresetId;
  setPreset: (preset: ThemePresetId) => void;
}

const ThemePresetContext = React.createContext<ThemePresetContextValue | null>(
  null,
);

export function ThemePresetProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { resolvedTheme } = useTheme();
  const [preset, setPresetState] =
    React.useState<ThemePresetId>(DEFAULT_THEME_PRESET);

  React.useEffect(() => {
    const stored = window.localStorage.getItem(THEME_PRESET_STORAGE_KEY);
    if (stored && isThemePreset(stored)) {
      setPresetState(stored);
    }
  }, []);

  React.useEffect(() => {
    const mode: ThemeMode = resolvedTheme === "light" ? "light" : "dark";
    const root = document.documentElement;
    const selectedPreset = getThemePreset(preset);
    const cssVariables = createThemeCssVariables(selectedPreset.palette[mode], mode);

    root.dataset.themePreset = preset;
    for (const [key, value] of Object.entries(cssVariables)) {
      root.style.setProperty(key, value);
    }
  }, [preset, resolvedTheme]);

  const setPreset = React.useCallback((nextPreset: ThemePresetId) => {
    setPresetState(nextPreset);
    window.localStorage.setItem(THEME_PRESET_STORAGE_KEY, nextPreset);
  }, []);

  return (
    <ThemePresetContext.Provider value={{ preset, setPreset }}>
      {children}
    </ThemePresetContext.Provider>
  );
}

export function useThemePreset() {
  const context = React.useContext(ThemePresetContext);
  if (!context) {
    throw new Error("useThemePreset must be used inside ThemePresetProvider");
  }
  return context;
}
