import { CheckCircle2, Search } from "lucide-react";
import { type ThemePreset, type ThemePresetId } from "@/lib/theme-presets";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { InfoTile } from "@/components/ui/info-tile";
import { Input } from "@/components/ui/input";
import { Typography } from "@/components/ui/typography";

interface AppearancePresetDirectoryProps {
  query: string;
  presets: ThemePreset[];
  activePresetId: ThemePresetId;
  onQueryChange: (value: string) => void;
  onApply: (preset: ThemePresetId) => void;
}

export function AppearancePresetDirectory({
  query,
  presets,
  activePresetId,
  onQueryChange,
  onApply,
}: AppearancePresetDirectoryProps) {
  return (
    <Card variant="premium">
      <CardHeader variant="section" className="space-y-1">
        <CardTitle variant="section">
          Theme Preset Directory
        </CardTitle>
        <CardDescription>
          Select a preset by name and keep the same tokens across the whole app.
        </CardDescription>
      </CardHeader>
      <CardContent spacing="section" className="space-y-3 p-5">
        <div className="group relative">
          <Input
            variant="table"
            value={query}
            placeholder="Search theme presets..."
            onChange={(event) => onQueryChange(event.target.value)}
            className="pl-9"
          />
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary transition-colors group-hover:text-primary">
            <Search className="h-4 w-4" />
          </span>
        </div>

        <div className="space-y-2">
          {presets.length === 0 ? (
            <InfoTile padding="none" className="px-4 py-6 text-center text-sm text-text-secondary">
              No presets match your search.
            </InfoTile>
          ) : (
            presets.map((themePreset) => {
              const active = activePresetId === themePreset.id;

              return (
                <InfoTile
                  key={themePreset.id}
                  padding="content"
                  className="transition-colors hover:border-borderStrong"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="space-y-1">
                      <Typography as="p" variant="body" className="text-sm font-semibold text-text-primary">
                        {themePreset.label}
                      </Typography>
                      <Typography as="p" variant="muted" className="text-xs leading-relaxed text-text-secondary">
                        {themePreset.description}
                      </Typography>
                    </div>
                    {active ? (
                      <Badge variant="success" size="xs" className="gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Active
                      </Badge>
                    ) : null}
                  </div>

                  <div className="mt-3 flex justify-end">
                    <Button
                      type="button"
                      variant={active ? "default" : "outline"}
                      size="sm"
                      onClick={() => onApply(themePreset.id)}
                    >
                      {active ? "Selected" : "Apply"}
                    </Button>
                  </div>
                </InfoTile>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
