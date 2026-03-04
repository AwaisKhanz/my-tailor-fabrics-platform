"use client";

import { Moon, Palette, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useThemePreset } from "@/components/ThemePresetProvider";
import {
  THEME_PRESETS,
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

function ThemeSwatchRow({
  label,
  colors,
}: {
  label: string;
  colors: string[];
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </p>
      <div className="grid grid-cols-5 gap-1.5">
        {colors.map((color, index) => (
          <span
            key={`${label}-${index}`}
            className="h-4 rounded-sm border border-border/70"
            style={{ backgroundColor: color }}
            aria-label={`${label} swatch ${index + 1}`}
          />
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
  const lightPreview = [
    preset.palette.light.primary,
    preset.palette.light.secondary,
    preset.palette.light.accent,
    preset.palette.light.background,
    preset.palette.light.surface,
  ];

  const darkPreview = [
    preset.palette.dark.primary,
    preset.palette.dark.secondary,
    preset.palette.dark.accent,
    preset.palette.dark.background,
    preset.palette.dark.surface,
  ];

  return (
    <Card
      className={cn(
        "border-border/70 bg-card/95 transition-all",
        active && "border-primary/40 ring-1 ring-primary/20",
      )}
    >
      <CardHeader variant="section" className="space-y-1.5">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-base font-semibold">{preset.label}</CardTitle>
          {active ? <Badge variant="info">Active</Badge> : null}
        </div>
        <CardDescription className="text-xs leading-relaxed">{preset.description}</CardDescription>
      </CardHeader>
      <CardContent spacing="section" className="space-y-4 p-5">
        <div className="space-y-3">
          <ThemeSwatchRow label="Light" colors={lightPreview} />
          <ThemeSwatchRow label="Dark" colors={darkPreview} />
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
        title="Appearance"
        description="Choose workspace mode and theme preset. Settings are saved on this browser."
      />

      <PageSection className="grid gap-4 lg:grid-cols-[340px_minmax(0,1fr)] lg:items-start">
        <Card className="border-border/70 bg-card/95 lg:sticky lg:top-20">
          <CardHeader variant="section" className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Palette className="h-4 w-4 text-primary" />
              Mode
            </CardTitle>
            <CardDescription>
              Switch between light and dark workspace rendering.
            </CardDescription>
          </CardHeader>
          <CardContent spacing="section" className="grid grid-cols-1 gap-2 p-5 sm:grid-cols-2 lg:grid-cols-1">
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

        <div className="space-y-3">
          <h2 className="text-base font-semibold">Theme Presets</h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {THEME_PRESETS.map((themePreset) => (
              <PresetCard
                key={themePreset.id}
                preset={themePreset}
                active={preset === themePreset.id}
                onApply={setPreset}
              />
            ))}
          </div>
        </div>
      </PageSection>
    </PageShell>
  );
}
