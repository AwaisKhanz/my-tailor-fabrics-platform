import { Save, Settings2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { InfoTile } from "@/components/ui/info-tile";
import { SectionHeader } from "@/components/ui/section-header";
import { SectionIcon } from "@/components/ui/section-icon";
import { Switch } from "@/components/ui/switch";
import { Text } from "@/components/ui/typography";

interface SystemSettingsWorkflowCardProps {
  loading: boolean;
  saving: boolean;
  workflowEnabled: boolean;
  dirty: boolean;
  onWorkflowChange: (enabled: boolean) => void;
  onReset: () => void;
  onSave: () => void | Promise<void>;
}

export function SystemSettingsWorkflowCard({
  loading,
  saving,
  workflowEnabled,
  dirty,
  onWorkflowChange,
  onReset,
  onSave,
}: SystemSettingsWorkflowCardProps) {
  return (
    <Card>
      <CardHeader surface="mutedSection" trimBottom className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <SectionHeader
            title="Workflow Engine"
            description="Toggle production task generation at the platform level."
            icon={
              <SectionIcon size="sm">
                <Settings2 className="h-4 w-4" />
              </SectionIcon>
            }
            className="flex-1"
            textClassName="space-y-1"
          />
          <Badge variant={workflowEnabled ? "success" : "outline"}>
            {workflowEnabled ? "Enabled" : "Disabled"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent spacing="section" className="space-y-5 p-5">
        <InfoTile padding="contentLg">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <Text
                as="p"
                 variant="body"
                className="text-sm font-semibold text-foreground"
              >
                Enable Task Workflow
              </Text>
              <Text
                as="p"
                 variant="lead"
                className="text-sm text-muted-foreground"
              >
                When enabled, newly created order items generate step-based
                tasks using garment workflow templates.
              </Text>
            </div>
            <Switch
              checked={workflowEnabled}
              onCheckedChange={onWorkflowChange}
              disabled={loading || saving}
              aria-label="Toggle task workflow"
            />
          </div>
        </InfoTile>

        <div className="flex flex-wrap justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onReset}
            disabled={!dirty || saving}
          >
            Reset
          </Button>
          <Button
            type="button"
            variant="default"
            onClick={() => void onSave()}
            disabled={!dirty || loading || saving}
          >
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
