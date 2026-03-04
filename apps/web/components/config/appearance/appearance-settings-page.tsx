"use client";

import { PageHeader } from "@/components/ui/page-header";
import { PageSection, PageShell } from "@/components/ui/page-shell";
import { useAppearanceSettingsPage } from "@/hooks/use-appearance-settings-page";
import { AppearanceStatsGrid } from "@/components/config/appearance/appearance-stats-grid";
import { AppearanceModeCard } from "@/components/config/appearance/appearance-mode-card";
import { AppearancePresetDirectory } from "@/components/config/appearance/appearance-preset-directory";

export function AppearanceSettingsPage() {
  const {
    query,
    isDark,
    preset,
    activePreset,
    totalPresets,
    filteredPresets,
    setQuery,
    setPreset,
    setTheme,
  } = useAppearanceSettingsPage();

  return (
    <PageShell>
      <PageSection spacing="compact">
        <PageHeader
          title="Appearance"
          description="Choose workspace mode and theme preset. Settings are saved on this browser."
          density="compact"
        />
      </PageSection>

      <PageSection spacing="compact">
        <AppearanceStatsGrid
          modeLabel={isDark ? "Dark" : "Light"}
          activePreset={activePreset.label}
          totalPresets={totalPresets}
        />
      </PageSection>

      <PageSection spacing="compact" className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start">
        <AppearanceModeCard
          isDark={isDark}
          onSetMode={setTheme}
        />
        <AppearancePresetDirectory
          query={query}
          presets={filteredPresets}
          activePresetId={preset}
          onQueryChange={setQuery}
          onApply={setPreset}
        />
      </PageSection>
    </PageShell>
  );
}
