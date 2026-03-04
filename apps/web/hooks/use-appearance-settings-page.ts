"use client";

import { useMemo, useState } from "react";
import { useTheme } from "next-themes";
import { useThemePreset } from "@/components/ThemePresetProvider";
import { THEME_PRESETS, getThemePreset, type ThemePreset } from "@/lib/theme-presets";

export function useAppearanceSettingsPage() {
  const { resolvedTheme, setTheme } = useTheme();
  const { preset, setPreset } = useThemePreset();
  const [query, setQuery] = useState("");

  const isDark = resolvedTheme !== "light";
  const activePreset = getThemePreset(preset);

  const filteredPresets = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return THEME_PRESETS;
    }

    return THEME_PRESETS.filter((themePreset: ThemePreset) => {
      return (
        themePreset.label.toLowerCase().includes(normalized) ||
        themePreset.description.toLowerCase().includes(normalized)
      );
    });
  }, [query]);

  return {
    query,
    isDark,
    preset,
    activePreset,
    totalPresets: THEME_PRESETS.length,
    filteredPresets,
    setQuery,
    setPreset,
    setTheme,
  };
}
