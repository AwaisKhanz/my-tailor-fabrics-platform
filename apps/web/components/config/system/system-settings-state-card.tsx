import { Workflow } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { InfoTile } from "@/components/ui/info-tile";

interface SystemSettingsStateCardProps {
  workflowEnabled: boolean;
  lastUpdatedText: string;
}

export function SystemSettingsStateCard({
  workflowEnabled,
  lastUpdatedText,
}: SystemSettingsStateCardProps) {
  return (
    <Card variant="elevatedPanel">
      <CardHeader variant="section" className="space-y-1">
        <CardTitle variant="section" className="flex items-center gap-2">
          <Workflow className="h-4 w-4 text-primary" />
          Current State
        </CardTitle>
        <CardDescription>
          Snapshot of effective system behavior.
        </CardDescription>
      </CardHeader>
      <CardContent spacing="section" className="space-y-4 p-5 text-sm">
        <InfoTile layout="betweenGap" padding="md" className="rounded-md">
          <span className="text-text-secondary">Task workflow</span>
          <span className="font-semibold text-text-primary">
            {workflowEnabled ? "Active" : "Inactive"}
          </span>
        </InfoTile>
        <InfoTile layout="betweenGap" padding="md" className="rounded-md">
          <span className="text-text-secondary">Last updated</span>
          <span className="font-medium text-text-primary">
            {lastUpdatedText}
          </span>
        </InfoTile>
      </CardContent>
    </Card>
  );
}
