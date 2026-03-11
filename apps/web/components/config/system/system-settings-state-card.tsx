import { Workflow } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@tbms/ui/components/card";

interface SystemSettingsStateCardProps {
  workflowEnabled: boolean;
  lastUpdatedText: string;
}

export function SystemSettingsStateCard({
  workflowEnabled,
  lastUpdatedText,
}: SystemSettingsStateCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <CardTitle>Current State</CardTitle>
            <CardDescription>
              Snapshot of effective system behavior.
            </CardDescription>
          </div>
          <Workflow className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-5 text-sm">
        <div className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-2">
          <span className="text-muted-foreground">Task workflow</span>
          <span className="font-semibold text-foreground">
            {workflowEnabled ? "Active" : "Inactive"}
          </span>
        </div>
        <div className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-2">
          <span className="text-muted-foreground">Last updated</span>
          <span className="font-medium text-foreground">
            {lastUpdatedText}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
