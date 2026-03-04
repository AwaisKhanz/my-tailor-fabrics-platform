import type { ThemePaletteV2 } from "@/lib/theme-presets";

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

function resolveForeground(
  background: string,
  preferred: string | undefined,
  fallbackA: string,
  fallbackB: string,
): string {
  if (preferred && preferred.trim().length > 0) {
    return preferred;
  }

  return pickReadableForeground(background, fallbackA, fallbackB);
}

export function createThemeCssVariables(
  palette: ThemePaletteV2,
  mode: ThemeMode,
): Record<string, string> {
  const primaryForeground = resolveForeground(
    palette.primary,
    palette.primaryForeground,
    palette.textInverse,
    palette.textPrimary,
  );

  const secondaryForeground = resolveForeground(
    palette.secondary,
    palette.secondaryForeground,
    palette.textInverse,
    palette.textPrimary,
  );

  const accentForeground = resolveForeground(
    palette.accent,
    palette.accentForeground,
    palette.textInverse,
    palette.textPrimary,
  );

  const destructiveForeground = resolveForeground(
    palette.error,
    palette.errorForeground,
    palette.textInverse,
    palette.textPrimary,
  );

  const successForeground = resolveForeground(
    palette.success,
    palette.successForeground,
    palette.textInverse,
    palette.textPrimary,
  );

  const warningForeground = resolveForeground(
    palette.warning,
    palette.warningForeground,
    palette.textInverse,
    palette.textPrimary,
  );

  const infoForeground = resolveForeground(
    palette.info,
    palette.infoForeground,
    palette.textInverse,
    palette.textPrimary,
  );

  const pendingForeground = resolveForeground(
    palette.pending,
    palette.pendingForeground,
    palette.textInverse,
    palette.textPrimary,
  );

  const readyForeground = resolveForeground(
    palette.ready,
    palette.readyForeground,
    palette.textInverse,
    palette.textPrimary,
  );

  const mutedSurface = palette.pendingMuted ?? buildMuted(palette.background, mode);
  const accentSurface = palette.hover ?? buildAccent(palette.accent, mode);

  return {
    // Canonical V2 tokens
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
    "--muted": colorToHslVarValue(mutedSurface),
    "--muted-foreground": colorToHslVarValue(palette.textSecondary),
    "--accent": colorToHslVarValue(accentSurface),
    "--accent-foreground": colorToHslVarValue(accentForeground),
    "--destructive": colorToHslVarValue(palette.error),
    "--destructive-foreground": colorToHslVarValue(destructiveForeground),
    "--error": colorToHslVarValue(palette.error),
    "--error-foreground": colorToHslVarValue(destructiveForeground),
    "--error-muted": colorToHslVarValue(palette.errorMuted),
    "--border": colorToHslVarValue(palette.border),
    "--input": colorToHslVarValue(palette.inputBorder),
    "--ring": colorToHslVarValue(palette.focusRing ?? palette.primary),

    "--surface": colorToHslVarValue(palette.surface),
    "--surface-elevated": colorToHslVarValue(palette.surfaceElevated),

    "--app-bar": colorToHslVarValue(palette.appBar),
    "--app-bar-foreground": colorToHslVarValue(palette.appBarText),
    "--sidebar": colorToHslVarValue(palette.sidebar),
    "--sidebar-foreground": colorToHslVarValue(palette.sidebarText),
    "--sidebar-active": colorToHslVarValue(palette.sidebarActive),
    "--sidebar-border": colorToHslVarValue(palette.sidebarBorder),

    "--text-primary": colorToHslVarValue(palette.textPrimary),
    "--text-secondary": colorToHslVarValue(palette.textSecondary),
    "--text-disabled": colorToHslVarValue(palette.textDisabled),
    "--text-inverse": colorToHslVarValue(palette.textInverse),

    "--border-strong": colorToHslVarValue(palette.borderStrong),
    "--divider": colorToHslVarValue(palette.divider),

    "--hover": colorToHslVarValue(palette.hover),
    "--active": colorToHslVarValue(palette.active),
    "--focus-ring": colorToHslVarValue(palette.focusRing),
    "--success": colorToHslVarValue(palette.success),
    "--success-foreground": colorToHslVarValue(successForeground),
    "--success-muted": colorToHslVarValue(palette.successMuted),
    "--warning": colorToHslVarValue(palette.warning),
    "--warning-foreground": colorToHslVarValue(warningForeground),
    "--warning-muted": colorToHslVarValue(palette.warningMuted),
    "--info": colorToHslVarValue(palette.info),
    "--info-foreground": colorToHslVarValue(infoForeground),
    "--info-muted": colorToHslVarValue(palette.infoMuted),
    "--pending": colorToHslVarValue(palette.pending),
    "--pending-foreground": colorToHslVarValue(pendingForeground),
    "--pending-muted": colorToHslVarValue(palette.pendingMuted),
    "--ready": colorToHslVarValue(palette.ready),
    "--ready-foreground": colorToHslVarValue(readyForeground),
    "--ready-muted": colorToHslVarValue(palette.readyMuted),

    "--input-background": colorToHslVarValue(palette.inputBackground),
    "--input-text": colorToHslVarValue(palette.inputText),
    "--input-placeholder": colorToHslVarValue(palette.inputPlaceholder),
    "--input-border": colorToHslVarValue(palette.inputBorder),

    "--code-background": colorToHslVarValue(palette.codeBackground),
    "--code-text": colorToHslVarValue(palette.codeText),

    "--scrollbar": colorToHslVarValue(palette.scrollbar),
    "--scrollbar-track": colorToHslVarValue(palette.scrollbarTrack),
    "--shadow-color": colorToHslVarValue(palette.shadowColor),

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

    // Compatibility aliases (temporary during migration cycle)
    "--legacy-surface": colorToHslVarValue(palette.surface),
    "--legacy-text-primary": colorToHslVarValue(palette.textPrimary),
    "--legacy-text-secondary": colorToHslVarValue(palette.textSecondary),
    "--legacy-border": colorToHslVarValue(palette.border),
    "--legacy-overlay": colorToHslVarValue(palette.overlay),
    "--legacy-overlay-strong": colorToHslVarValue(palette.overlayStrong),
    "--legacy-pending": colorToHslVarValue(palette.pending),
    "--legacy-ready": colorToHslVarValue(palette.ready),
  };
}
