import { Save, Settings2 } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";

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
    <Card variant="panel">
      <CardHeader variant="section" className="space-y-1">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Settings2 className="h-4 w-4 text-primary" />
            Workflow Engine
          </CardTitle>
          <Badge variant={workflowEnabled ? "success" : "outline"}>
            {workflowEnabled ? "Enabled" : "Disabled"}
          </Badge>
        </div>
        <CardDescription>
          Toggle production task generation at the platform level.
        </CardDescription>
      </CardHeader>

      <CardContent spacing="section" className="space-y-5 p-5">
        <InfoTile padding="contentLg">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-text-primary">
                Enable Task Workflow
              </p>
              <p className="text-sm text-text-secondary">
                When enabled, newly created order items generate step-based
                tasks using garment workflow templates.
              </p>
            </div>
            <Switch
              variant="premium"
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
            variant="premium"
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
