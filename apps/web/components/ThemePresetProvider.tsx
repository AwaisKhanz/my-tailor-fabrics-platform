"use client";

import * as React from "react";
import {
  DEFAULT_THEME_PRESET,
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
  const [preset, setPresetState] =
    React.useState<ThemePresetId>(DEFAULT_THEME_PRESET);

  React.useEffect(() => {
    const stored = window.localStorage.getItem(THEME_PRESET_STORAGE_KEY);
    if (stored && isThemePreset(stored)) {
      setPresetState(stored);
    }
  }, []);

  React.useEffect(() => {
    document.documentElement.dataset.themePreset = preset;
  }, [preset]);

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
