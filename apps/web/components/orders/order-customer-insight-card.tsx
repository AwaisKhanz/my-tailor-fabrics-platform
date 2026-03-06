import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { InfoTile } from "@/components/ui/info-tile";
import { Label } from "@/components/ui/label";
import { SectionHeader } from "@/components/ui/section-header";
import { SectionIcon } from "@/components/ui/section-icon";
import { UserRound } from "lucide-react";
import { Order, type MeasurementValues } from "@tbms/shared-types";

interface MeasurementDisplayItem {
  label: string;
  value: string;
}

interface OrderCustomerInsightCardProps {
  customer: Order["customer"];
}

function getMeasurementPreview(
  customer: Order["customer"],
): MeasurementDisplayItem[] {
  const measurementSet = customer.measurements?.[0];
  if (!measurementSet?.values) {
    return [];
  }

  const fields = measurementSet.category?.fields ?? [];
  const values: MeasurementValues = measurementSet.values;

  return Object.entries(values)
    .map(([fieldId, value]) => {
      const matchedField = fields.find((field) => field.id === fieldId);
      return {
        label: matchedField?.label ?? fieldId,
        value: value === null ? "-" : String(value),
      };
    })
    .slice(0, 10);
}

export function OrderCustomerInsightCard({
  customer,
}: OrderCustomerInsightCardProps) {
  const measurementPreview = getMeasurementPreview(customer);

  return (
    <Card variant="elevatedPanel">
      <CardHeader
        variant="rowSection"
        density="comfortable"
        align="startResponsive"
      >
        <SectionHeader
          title="Customer Profile"
          titleVariant="dashboard"
          description="Contact details and saved measurements."
          icon={
            <SectionIcon tone="infoSoft" size="lg">
              <UserRound className="h-4 w-4 text-primary" />
            </SectionIcon>
          }
        />
        <Badge
          variant="outline"
          size="xs"
          className="font-bold uppercase tracking-[0.08em]"
        >
          {customer.sizeNumber}
        </Badge>
      </CardHeader>

      <CardContent spacing="section" padding="inset" className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <InfoTile tone="elevatedSoft">
            <Label variant="micro">Full Name</Label>
            <p className="mt-1 text-sm font-semibold text-text-primary">
              {customer.fullName}
            </p>
          </InfoTile>
          <InfoTile tone="elevatedSoft">
            <Label variant="micro">Phone</Label>
            <p className="mt-1 text-sm font-semibold text-text-primary">
              {customer.phone || "-"}
            </p>
          </InfoTile>
          <InfoTile tone="elevatedSoft">
            <Label variant="micro">City</Label>
            <p className="mt-1 text-sm font-semibold text-text-primary">
              {customer.city || "-"}
            </p>
          </InfoTile>
        </div>

        <InfoTile tone="elevatedSoft" padding="contentLg">
          <div className="mb-3 flex items-center justify-between">
            <Label variant="micro">Measurement Snapshot</Label>
            <Badge
              variant="info"
              size="xs"
              className="font-bold uppercase tracking-[0.08em]"
            >
              Synced
            </Badge>
          </div>

          {measurementPreview.length === 0 ? (
            <p className="py-4 text-center text-xs text-text-secondary">
              No measurements available for this customer.
            </p>
          ) : (
            <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
              {measurementPreview.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between gap-3"
                >
                  <span className="truncate text-xs text-text-secondary">
                    {item.label}
                  </span>
                  <span className="shrink-0 text-xs font-semibold tabular-nums text-text-primary">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </InfoTile>
      </CardContent>
    </Card>
  );
}
