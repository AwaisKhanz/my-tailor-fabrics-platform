import { Workflow } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { InfoTile } from "@/components/ui/info-tile";
import { SectionHeader } from "@/components/ui/section-header";
import { SectionIcon } from "@/components/ui/section-icon";

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
      <CardHeader variant="section">
        <SectionHeader
          title="Current State"
          description="Snapshot of effective system behavior."
          icon={
            <SectionIcon size="sm">
              <Workflow className="h-4 w-4" />
            </SectionIcon>
          }
        />
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
