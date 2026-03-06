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
    <Card>
      <CardHeader className="border-b !rounded-b-none border-border bg-muted/40 px-6 py-4">
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
          <span className="text-muted-foreground">Task workflow</span>
          <span className="font-semibold text-foreground">
            {workflowEnabled ? "Active" : "Inactive"}
          </span>
        </InfoTile>
        <InfoTile layout="betweenGap" padding="md" className="rounded-md">
          <span className="text-muted-foreground">Last updated</span>
          <span className="font-medium text-foreground">
            {lastUpdatedText}
          </span>
        </InfoTile>
      </CardContent>
    </Card>
  );
}
