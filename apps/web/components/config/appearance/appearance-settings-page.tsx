"use client";

import { Moon, Palette, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useThemePreset } from "@/components/ThemePresetProvider";
import {
  THEME_PRESETS,
  type ThemePalette,
  type ThemePreset,
  type ThemePresetId,
} from "@/lib/theme-presets";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { PageSection, PageShell } from "@/components/ui/page-shell";

const paletteKeys: Array<keyof ThemePalette> = [
  "primary",
  "secondary",
  "accent",
  "background",
  "surface",
  "textPrimary",
  "textSecondary",
  "success",
  "warning",
  "error",
  "border",
];

function PaletteGrid({
  title,
  palette,
}: {
  title: string;
  palette: ThemePalette;
}) {
  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        {title}
      </h4>
      <div className="grid grid-cols-1 gap-2">
        {paletteKeys.map((key) => (
          <div
            key={key}
            className="flex items-center justify-between rounded-md border border-border/70 bg-background/60 p-2"
          >
            <div className="flex items-center gap-2">
              <span
                className="h-4 w-4 rounded-sm border border-border/70"
                style={{ backgroundColor: palette[key] }}
                aria-label={`${key} swatch`}
              />
              <span className="text-xs font-medium capitalize text-foreground">
                {key}
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground">{palette[key]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PresetCard({
  preset,
  active,
  onApply,
}: {
  preset: ThemePreset;
  active: boolean;
  onApply: (preset: ThemePresetId) => void;
}) {
  return (
    <Card
      className={cn(
        "border-border/70 bg-card/95 transition-colors",
        active && "border-primary/40",
      )}
    >
      <CardHeader variant="section" className="space-y-1">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-base font-semibold">{preset.label}</CardTitle>
          {active ? <Badge variant="info">Active</Badge> : null}
        </div>
        <CardDescription>{preset.description}</CardDescription>
      </CardHeader>
      <CardContent spacing="section" className="space-y-4 p-5">
        <div className="grid gap-4 xl:grid-cols-2">
          <PaletteGrid title="Light Palette" palette={preset.palette.light} />
          <PaletteGrid title="Dark Palette" palette={preset.palette.dark} />
        </div>

        <Button
          type="button"
          variant={active ? "default" : "outline"}
          className="w-full"
          onClick={() => onApply(preset.id)}
        >
          {active ? "Selected" : "Apply Theme"}
        </Button>
      </CardContent>
    </Card>
  );
}

export function AppearanceSettingsPage() {
  const { theme, setTheme } = useTheme();
  const { preset, setPreset } = useThemePreset();
  const isDark = theme !== "light";

  return (
    <PageShell>
      <PageHeader
        title="Appearance Settings"
        description="Choose theme mode and color preset. Your preference is saved on this browser."
      />

      <PageSection className="grid gap-4 md:grid-cols-2">
        <Card className="border-border/70 bg-card/95">
          <CardHeader variant="section" className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Palette className="h-4 w-4 text-primary" />
              Color Mode
            </CardTitle>
            <CardDescription>Switch between light and dark workspace mode.</CardDescription>
          </CardHeader>
          <CardContent spacing="section" className="grid grid-cols-1 gap-2 p-5 sm:grid-cols-2">
            <Button
              type="button"
              variant={!isDark ? "default" : "outline"}
              className="justify-start"
              onClick={() => setTheme("light")}
            >
              <Sun className="h-4 w-4" />
              Light Mode
            </Button>
            <Button
              type="button"
              variant={isDark ? "default" : "outline"}
              className="justify-start"
              onClick={() => setTheme("dark")}
            >
              <Moon className="h-4 w-4" />
              Dark Mode
            </Button>
          </CardContent>
        </Card>
      </PageSection>

      <PageSection className="space-y-3">
        <h2 className="text-base font-semibold">Theme Presets</h2>
        <div className="grid gap-4">
          {THEME_PRESETS.map((themePreset) => (
            <PresetCard
              key={themePreset.id}
              preset={themePreset}
              active={preset === themePreset.id}
              onApply={setPreset}
            />
          ))}
        </div>
      </PageSection>
    </PageShell>
  );
}
