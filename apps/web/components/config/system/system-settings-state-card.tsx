import { Workflow } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface SystemSettingsStateCardProps {
  workflowEnabled: boolean;
  lastUpdatedText: string;
}

export function SystemSettingsStateCard({
  workflowEnabled,
  lastUpdatedText,
}: SystemSettingsStateCardProps) {
  return (
    <Card className="border-border/70 bg-card/95">
      <CardHeader variant="section" className="space-y-1">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Workflow className="h-4 w-4 text-primary" />
          Current State
        </CardTitle>
        <CardDescription>
          Snapshot of effective system behavior.
        </CardDescription>
      </CardHeader>
      <CardContent spacing="section" className="space-y-4 p-5 text-sm">
        <div className="flex items-center justify-between gap-3 rounded-md border border-border/70 bg-background/40 px-3 py-2">
          <span className="text-muted-foreground">Task workflow</span>
          <span className="font-semibold text-foreground">
            {workflowEnabled ? "Active" : "Inactive"}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3 rounded-md border border-border/70 bg-background/40 px-3 py-2">
          <span className="text-muted-foreground">Last updated</span>
          <span className="font-medium text-foreground">{lastUpdatedText}</span>
        </div>
      </CardContent>
    </Card>
  );
}
