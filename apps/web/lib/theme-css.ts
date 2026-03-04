import type { ThemePalette } from "@/lib/theme-presets";

export type ThemeMode = "light" | "dark";

interface RgbColor {
  r: number;
  g: number;
  b: number;
  a?: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function parseHexColor(value: string): RgbColor | null {
  const hex = value.trim().replace(/^#/, "");

  if (![3, 4, 6, 8].includes(hex.length)) {
    return null;
  }

  const normalized =
    hex.length <= 4
      ? hex
          .split("")
          .map((part) => `${part}${part}`)
          .join("")
      : hex;

  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);

  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
    return null;
  }

  if (normalized.length === 8) {
    const alphaByte = Number.parseInt(normalized.slice(6, 8), 16);
    if (Number.isNaN(alphaByte)) {
      return null;
    }

    return { r, g, b, a: clamp(alphaByte / 255, 0, 1) };
  }

  return { r, g, b };
}

function parseRgbColor(value: string): RgbColor | null {
  const match = value
    .trim()
    .match(/^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*(\d*\.?\d+))?\s*\)$/i);

  if (!match) {
    return null;
  }

  const r = clamp(Number.parseInt(match[1], 10), 0, 255);
  const g = clamp(Number.parseInt(match[2], 10), 0, 255);
  const b = clamp(Number.parseInt(match[3], 10), 0, 255);
  const a = match[4] !== undefined ? clamp(Number.parseFloat(match[4]), 0, 1) : undefined;

  if ([r, g, b].some((channel) => Number.isNaN(channel))) {
    return null;
  }

  return { r, g, b, a };
}

function parseColor(value: string): RgbColor | null {
  if (value.trim().startsWith("#")) {
    return parseHexColor(value);
  }

  if (value.trim().toLowerCase().startsWith("rgb")) {
    return parseRgbColor(value);
  }

  return null;
}

function rgbToHsl(color: RgbColor): { h: number; s: number; l: number; a?: number } {
  const r = color.r / 255;
  const g = color.g / 255;
  const b = color.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;

  if (delta !== 0) {
    switch (max) {
      case r:
        h = ((g - b) / delta) % 6;
        break;
      case g:
        h = (b - r) / delta + 2;
        break;
      default:
        h = (r - g) / delta + 4;
    }
  }

  h = Math.round((h * 60 + 360) % 360);
  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

  return {
    h,
    s: Math.round(s * 1000) / 10,
    l: Math.round(l * 1000) / 10,
    a: color.a,
  };
}

function colorToHslVarValue(value: string): string {
  const parsed = parseColor(value);
  if (!parsed) {
    return "0 0% 0%";
  }

  const { h, s, l, a } = rgbToHsl(parsed);

  if (a !== undefined) {
    return `${h} ${s}% ${l}% / ${a}`;
  }

  return `${h} ${s}% ${l}%`;
}

function relativeLuminance(color: RgbColor): number {
  const channels = [color.r, color.g, color.b].map((channel) => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrastRatio(a: RgbColor, b: RgbColor): number {
  const lumA = relativeLuminance(a);
  const lumB = relativeLuminance(b);

  const brighter = Math.max(lumA, lumB);
  const darker = Math.min(lumA, lumB);
  return (brighter + 0.05) / (darker + 0.05);
}

function pickReadableForeground(background: string, optionA: string, optionB: string): string {
  const bgColor = parseColor(background);
  const aColor = parseColor(optionA);
  const bColor = parseColor(optionB);

  if (!bgColor || !aColor || !bColor) {
    return optionA;
  }

  return contrastRatio(bgColor, aColor) >= contrastRatio(bgColor, bColor) ? optionA : optionB;
}

function buildMuted(baseColor: string, mode: ThemeMode): string {
  const parsed = parseColor(baseColor);
  if (!parsed) {
    return "0 0% 100%";
  }

  const hsl = rgbToHsl(parsed);
  const shift = mode === "dark" ? 8 : -3;
  const lightness = clamp(hsl.l + shift, 2, 98);
  return `${hsl.h} ${hsl.s}% ${lightness}%`;
}

function buildAccent(baseColor: string, mode: ThemeMode): string {
  const parsed = parseColor(baseColor);
  if (!parsed) {
    return "0 0% 0% / 0.16";
  }

  const hsl = rgbToHsl(parsed);
  const alpha = mode === "dark" ? 0.2 : 0.16;
  return `${hsl.h} ${hsl.s}% ${hsl.l}% / ${alpha}`;
}

export function createThemeCssVariables(palette: ThemePalette, mode: ThemeMode): Record<string, string> {
  const primaryForeground = pickReadableForeground(
    palette.primary,
    palette.background,
    palette.textPrimary,
  );

  const secondaryForeground = pickReadableForeground(
    palette.secondary,
    palette.background,
    palette.textPrimary,
  );

  const destructiveForeground = pickReadableForeground(
    palette.error,
    palette.background,
    palette.textPrimary,
  );

  const successForeground = pickReadableForeground(
    palette.success,
    palette.background,
    palette.textPrimary,
  );

  const warningForeground = pickReadableForeground(
    palette.warning,
    palette.background,
    palette.textPrimary,
  );

  const infoForeground = pickReadableForeground(
    palette.info,
    palette.background,
    palette.textPrimary,
  );

  const pendingForeground = pickReadableForeground(
    palette.pending,
    palette.background,
    palette.textPrimary,
  );

  const readyForeground = pickReadableForeground(
    palette.ready,
    palette.background,
    palette.textPrimary,
  );

  return {
    "--background": colorToHslVarValue(palette.background),
    "--foreground": colorToHslVarValue(palette.textPrimary),
    "--card": colorToHslVarValue(palette.surface),
    "--card-foreground": colorToHslVarValue(palette.textPrimary),
    "--popover": colorToHslVarValue(palette.surface),
    "--popover-foreground": colorToHslVarValue(palette.textPrimary),
    "--primary": colorToHslVarValue(palette.primary),
    "--primary-foreground": colorToHslVarValue(primaryForeground),
    "--secondary": colorToHslVarValue(palette.secondary),
    "--secondary-foreground": colorToHslVarValue(secondaryForeground),
    "--muted": buildMuted(palette.background, mode),
    "--muted-foreground": colorToHslVarValue(palette.textSecondary),
    "--accent": buildAccent(palette.accent, mode),
    "--accent-foreground": colorToHslVarValue(palette.accent),
    "--destructive": colorToHslVarValue(palette.error),
    "--destructive-foreground": colorToHslVarValue(destructiveForeground),
    "--border": colorToHslVarValue(palette.border),
    "--input": colorToHslVarValue(palette.border),
    "--ring": colorToHslVarValue(palette.primary),
    "--success": colorToHslVarValue(palette.success),
    "--success-foreground": colorToHslVarValue(successForeground),
    "--warning": colorToHslVarValue(palette.warning),
    "--warning-foreground": colorToHslVarValue(warningForeground),
    "--info": colorToHslVarValue(palette.info),
    "--info-foreground": colorToHslVarValue(infoForeground),
    "--pending": colorToHslVarValue(palette.pending),
    "--pending-foreground": colorToHslVarValue(pendingForeground),
    "--ready": colorToHslVarValue(palette.ready),
    "--ready-foreground": colorToHslVarValue(readyForeground),
    "--brand-dark": colorToHslVarValue(palette.brandDark),
    "--overlay": colorToHslVarValue(palette.overlay),
    "--overlay-strong": colorToHslVarValue(palette.overlayStrong),
    "--chart-1": colorToHslVarValue(palette.chart1),
    "--chart-2": colorToHslVarValue(palette.chart2),
    "--chart-3": colorToHslVarValue(palette.chart3),
    "--chart-4": colorToHslVarValue(palette.chart4),
    "--chart-5": colorToHslVarValue(palette.chart5),
    "--chart-6": colorToHslVarValue(palette.chart6),
    "--chart-7": colorToHslVarValue(palette.chart7),
    "--chart-8": colorToHslVarValue(palette.chart8),
  };
}
