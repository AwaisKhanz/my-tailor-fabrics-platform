import { Ruler } from "lucide-react";
import { type CustomerMeasurement } from "@tbms/shared-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Label } from "@/components/ui/label";
import { Typography } from "@/components/ui/typography";

interface CustomerMeasurementsTabProps {
  measurements: CustomerMeasurement[];
  onUpdateMeasurements: () => void;
  getMeasurementLabel: (categoryId: string, fieldId: string) => string;
  canUpdateMeasurements?: boolean;
}

export function CustomerMeasurementsTab({
  measurements,
  onUpdateMeasurements,
  getMeasurementLabel,
  canUpdateMeasurements = true,
}: CustomerMeasurementsTabProps) {
  return (
    <Card className="overflow-hidden border-border/70 bg-card/95">
      <CardHeader variant="rowSection" className="items-start gap-4 sm:items-center">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-semibold tracking-tight">Measurements</CardTitle>
            <Badge variant="secondary" size="xs" className="font-semibold">
              {measurements.length} SETS
            </Badge>
          </div>
          <Typography as="p" variant="muted">
            Keep sizing data updated for better fit accuracy and quicker order entry.
          </Typography>
        </div>
        {canUpdateMeasurements ? (
          <Button size="sm" className="w-full sm:w-auto" onClick={onUpdateMeasurements}>
            <Ruler className="mr-2 h-4 w-4" />
            Update Measurements
          </Button>
        ) : null}
      </CardHeader>

      <CardContent spacing="section" className="space-y-4 p-5 sm:p-6">
        {measurements.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {measurements.map((measurement) => (
              <Card key={measurement.id} className="overflow-hidden border-border/60 shadow-sm">
                <CardHeader variant="sectionSoft" density="compact">
                  <CardTitle className="flex items-center justify-between text-sm">
                    {measurement.category?.name || "Measurement Set"}
                    <Label variant="dashboard" className="font-normal opacity-60">
                      Updated: {new Date(measurement.updatedAt).toLocaleDateString()}
                    </Label>
                  </CardTitle>
                </CardHeader>

                <CardContent spacing="section" className="pt-4">
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {Object.entries(measurement.values).map(([key, value]) => (
                      <div key={key}>
                        <Label variant="dashboard" className="mb-0.5 block">
                          {getMeasurementLabel(measurement.categoryId, key)}
                        </Label>
                        <Typography as="p" variant="body" className="font-semibold">
                          {String(value)}
                        </Typography>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Ruler}
            title="No measurements recorded"
            description="Add the first measurement set to personalize order creation and fitting history."
            action={
              canUpdateMeasurements
                ? {
                    label: "Add First Measurement",
                    onClick: onUpdateMeasurements,
                  }
                : undefined
            }
          />
        )}
      </CardContent>
    </Card>
  );
}
