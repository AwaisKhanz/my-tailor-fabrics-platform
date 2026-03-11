"use client";

import * as React from "react";
import {
  ThemeProvider as NextThemesProvider,
  useTheme as useNextTheme,
} from "next-themes";
import {
  THEME_STORAGE_KEY,
  type AppTheme,
} from "@/lib/theme";

export function ThemeProvider({
  children,
  initialTheme,
}: {
  children: React.ReactNode;
  initialTheme?: AppTheme;
}) {
  return (
    <NextThemesProvider
      attribute="class"
      storageKey={THEME_STORAGE_KEY}
      defaultTheme={initialTheme ?? "system"}
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}

export function useTheme() {
  const { resolvedTheme, setTheme } = useNextTheme();
  const theme: AppTheme = resolvedTheme === "dark" ? "dark" : "light";

  return {
    theme,
    setTheme: (nextTheme: AppTheme) => setTheme(nextTheme),
    toggleTheme: () => setTheme(theme === "dark" ? "light" : "dark"),
  };
}
