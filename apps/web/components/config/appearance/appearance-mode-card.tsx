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
  return (
    <Card variant="panel" className="lg:sticky lg:top-20">
      <CardHeader variant="section" className="space-y-1">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
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
        <Button
          type="button"
          variant={!isDark ? "default" : "outline"}
          className="justify-start"
          onClick={() => onSetMode("light")}
        >
          <Sun className="h-4 w-4" />
          Light Mode
        </Button>
        <Button
          type="button"
          variant={isDark ? "default" : "outline"}
          className="justify-start"
          onClick={() => onSetMode("dark")}
        >
          <Moon className="h-4 w-4" />
          Dark Mode
        </Button>
      </CardContent>
    </Card>
  );
}
