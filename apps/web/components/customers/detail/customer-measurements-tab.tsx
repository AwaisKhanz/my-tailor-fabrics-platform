import { Ruler } from "lucide-react";
import { type CustomerMeasurement } from "@tbms/shared-types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Label } from "@/components/ui/label";
import { Typography } from "@/components/ui/typography";

interface CustomerMeasurementsTabProps {
  measurements: CustomerMeasurement[];
  onUpdateMeasurements: () => void;
  getMeasurementLabel: (categoryId: string, fieldId: string) => string;
}

export function CustomerMeasurementsTab({
  measurements,
  onUpdateMeasurements,
  getMeasurementLabel,
}: CustomerMeasurementsTabProps) {
  return (
    <div className="space-y-4 pt-4">
      <div className="flex items-center justify-between">
        <Typography as="h3" variant="sectionTitle">
          Body Measurements
        </Typography>
        <Button size="sm" onClick={onUpdateMeasurements}>
          <Ruler className="mr-2 h-4 w-4" />
          Update Measurements
        </Button>
      </div>

      {measurements.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {measurements.map((measurement) => (
            <Card key={measurement.id} className="overflow-hidden border-border/50 shadow-sm">
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
          action={{
            label: "Add First Measurement",
            onClick: onUpdateMeasurements,
          }}
        />
      )}
    </div>
  );
}
