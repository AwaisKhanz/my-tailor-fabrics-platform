"use client";

import * as React from "react";
import { Check, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useThemePreset } from "@/components/ThemePresetProvider";
import { THEME_PRESETS } from "@/lib/theme-presets";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { preset, setPreset } = useThemePreset();
  const isDark = theme !== "light";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="iconSm"
          className="rounded-lg border-border/80 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          aria-label="Toggle theme"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel>Color Mode</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className={cn("justify-between", !isDark && "text-primary")}
        >
          <span>Light</span>
          {!isDark ? <Check className="h-4 w-4" /> : null}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className={cn("justify-between", isDark && "text-primary")}
        >
          <span>Dark</span>
          {isDark ? <Check className="h-4 w-4" /> : null}
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuLabel>Theme Preset</DropdownMenuLabel>
        <div className="max-h-72 overflow-y-auto pr-1">
          {THEME_PRESETS.map((themePreset) => (
            <DropdownMenuItem
              key={themePreset.id}
              onClick={() => setPreset(themePreset.id)}
              className={cn(
                "justify-between",
                preset === themePreset.id && "text-primary",
              )}
            >
              <span>{themePreset.label}</span>
              {preset === themePreset.id ? <Check className="h-4 w-4" /> : null}
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
