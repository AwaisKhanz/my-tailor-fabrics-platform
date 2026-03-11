import { Ruler } from "lucide-react";
import { type CustomerMeasurement } from "@tbms/shared-types";
import { Badge } from "@tbms/ui/components/badge";
import { Button } from "@tbms/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@tbms/ui/components/card";
import { EmptyState } from "@tbms/ui/components/empty-state";
import { FieldLabel } from "@tbms/ui/components/field";
import { Text } from "@tbms/ui/components/typography";

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
      <CardHeader
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CardTitle>Measurements</CardTitle>
            <Badge variant="default" className="font-semibold">
              {measurements.length} SETS
            </Badge>
          </div>
          <Text as="p" variant="muted">
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

      <CardContent className="space-y-4">
        {measurements.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {measurements.map((measurement) => (
              <Card key={measurement.id} className="bg-muted shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-sm">
                    {measurement.category?.name || "Measurement Set"}
                    <FieldLabel className="font-normal opacity-60">
                      Updated:{" "}
                      {new Date(measurement.updatedAt).toLocaleDateString()}
                    </FieldLabel>
                  </CardTitle>
                </CardHeader>

                <CardContent className="pt-4">
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {Object.entries(measurement.values).map(([key, value]) => (
                      <div key={key}>
                        <FieldLabel block className="mb-0.5">
                          {getMeasurementLabel(measurement, key)}
                        </FieldLabel>
                        <Text as="p" variant="body" className="font-semibold">
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
