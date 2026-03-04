import { Moon, Palette, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface AppearanceModeCardProps {
  isDark: boolean;
  onSetMode: (mode: "light" | "dark") => void;
}

export function AppearanceModeCard({
  isDark,
  onSetMode,
}: AppearanceModeCardProps) {
  const modeOptions = [
    {
      id: "light",
      label: "Light Mode",
      icon: Sun,
      active: !isDark,
    },
    {
      id: "dark",
      label: "Dark Mode",
      icon: Moon,
      active: isDark,
    },
  ] as const;

  return (
    <Card variant="premium" className="lg:sticky lg:top-20">
      <CardHeader variant="section" className="space-y-1">
        <CardTitle variant="section" className="flex items-center gap-2">
          <Palette className="h-4 w-4 text-primary" />
          Display Mode
        </CardTitle>
        <CardDescription>
          Switch between light and dark workspace rendering.
        </CardDescription>
      </CardHeader>
      <CardContent
        spacing="section"
        className="grid grid-cols-1 gap-2 p-5 sm:grid-cols-2 lg:grid-cols-1"
      >
        {modeOptions.map((modeOption) => {
          const Icon = modeOption.icon;
          return (
            <Button
              key={modeOption.id}
              type="button"
              variant={modeOption.active ? "default" : "outline"}
              className="justify-start"
              onClick={() => onSetMode(modeOption.id)}
            >
              <Icon className="h-4 w-4" />
              {modeOption.label}
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
}
