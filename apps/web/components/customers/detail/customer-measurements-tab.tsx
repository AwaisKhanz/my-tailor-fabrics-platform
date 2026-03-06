import { Ruler } from "lucide-react";
import { type CustomerMeasurement } from "@tbms/shared-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/typography";

interface CustomerMeasurementsTabProps {
  measurements: CustomerMeasurement[];
  onUpdateMeasurements: () => void;
  getMeasurementLabel: (
    measurement: CustomerMeasurement,
    fieldId: string,
  ) => string;
  canUpdateMeasurements?: boolean;
}

export function CustomerMeasurementsTab({
  measurements,
  onUpdateMeasurements,
  getMeasurementLabel,
  canUpdateMeasurements = true,
}: CustomerMeasurementsTabProps) {
  return (
    <Card>
      <CardHeader align="startResponsive" gap="md" className="flex-row items-center !rounded-b-none justify-between gap-3 border-b border-border bg-muted/40 px-6 py-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CardTitle className="border-b !rounded-b-none border-border bg-muted/40 px-6 py-4">Measurements</CardTitle>
            <Badge variant="default" size="xs" className="font-semibold">
              {measurements.length} SETS
            </Badge>
          </div>
          <Text as="p"  variant="muted">
            Keep sizing data updated for better fit accuracy and quicker order
            entry.
          </Text>
        </div>
        {canUpdateMeasurements ? (
          <Button
            size="sm"
            className="w-full sm:w-auto"
            onClick={onUpdateMeasurements}
          >
            <Ruler className="mr-2 h-4 w-4" />
            Update Measurements
          </Button>
        ) : null}
      </CardHeader>

      <CardContent spacing="section" padding="inset" className="space-y-4">
        {measurements.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {measurements.map((measurement) => (
              <Card key={measurement.id} className="bg-muted/40 shadow-sm">
                <CardHeader density="compact" className="border-b !rounded-b-none border-border bg-card/70 px-6 py-4">
                  <CardTitle className="flex items-center justify-between text-sm">
                    {measurement.category?.name || "Measurement Set"}
                    <Label className="text-sm font-bold uppercase tracking-tight text-muted-foreground font-normal opacity-60">
                      Updated:{" "}
                      {new Date(measurement.updatedAt).toLocaleDateString()}
                    </Label>
                  </CardTitle>
                </CardHeader>

                <CardContent spacing="section" className="pt-4">
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {Object.entries(measurement.values).map(([key, value]) => (
                      <div key={key}>
                        <Label className="text-sm font-bold uppercase tracking-tight text-muted-foreground mb-0.5 block">
                          {getMeasurementLabel(measurement, key)}
                        </Label>
                        <Text
                          as="p"
                           variant="body"
                          className="font-semibold"
                        >
                          {String(value)}
                        </Text>
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
