import { Save, Settings2 } from "lucide-react";
import { Badge } from "@tbms/ui/components/badge";
import { Button } from "@tbms/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@tbms/ui/components/card";
import { Switch } from "@tbms/ui/components/switch";

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
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-1 items-start gap-2">
            <Settings2 className="mt-0.5 h-4 w-4 text-muted-foreground" />
            <div className="space-y-1">
              <CardTitle className="text-base">Workflow Engine</CardTitle>
              <CardDescription>
                Toggle production task generation at the platform level.
              </CardDescription>
            </div>
          </div>
          <Badge variant={workflowEnabled ? "default" : "outline"}>
            {workflowEnabled ? "Enabled" : "Disabled"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 p-5">
        <div className="flex items-start justify-between gap-4 rounded-md bg-muted/40 p-4">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">
              Enable Task Workflow
            </p>
            <p className="text-sm text-muted-foreground">
              When enabled, newly created order items generate step-based tasks
              using garment workflow templates.
            </p>
          </div>
          <Switch
            checked={workflowEnabled}
            onCheckedChange={onWorkflowChange}
            disabled={loading || saving}
            aria-label="Toggle task workflow"
          />
        </div>

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
