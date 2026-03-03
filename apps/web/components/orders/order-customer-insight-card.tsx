import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Package } from "lucide-react";
import { Order } from "@tbms/shared-types";

interface MeasurementDisplayItem {
  label: string;
  value: string;
}

interface OrderCustomerInsightCardProps {
  customer: Order["customer"];
}

function getMeasurementPreview(customer: Order["customer"]): MeasurementDisplayItem[] {
  const measurementSet = customer.measurements?.[0];
  if (!measurementSet?.values) {
    return [];
  }

  const fields = measurementSet.category?.fields ?? [];
  const values = measurementSet.values as Record<string, string>;

  return Object.entries(values)
    .map(([fieldId, value]) => {
      const matchedField = fields.find((field) => field.id === fieldId);
      return {
        label: matchedField?.label ?? fieldId,
        value,
      };
    })
    .slice(0, 8);
}

export function OrderCustomerInsightCard({
  customer,
}: OrderCustomerInsightCardProps) {
  const measurementPreview = getMeasurementPreview(customer);

  return (
    <Card className="overflow-hidden border-border shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 bg-muted/5 px-6 pb-4 pt-5">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
            <Package className="h-4 w-4 text-primary" />
          </div>
          <CardTitle variant="dashboard">Customer Insight</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="px-6 pb-6 pt-6">
        <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-2">
          <div className="space-y-6">
            <div className="space-y-1">
              <Label variant="dashboard" className="opacity-50">
                Legal Name
              </Label>
              <p className="text-2xl font-bold tracking-tight text-foreground">
                {customer.fullName}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label variant="dashboard" className="opacity-50">
                  Contact info
                </Label>
                <p className="text-sm font-bold text-foreground/90">
                  {customer.phone}
                </p>
              </div>

              <div className="space-y-1 text-right">
                <Label variant="dashboard" className="opacity-50">
                  Global ID
                </Label>
                <Badge
                  variant="outline"
                  className="text-[10px] font-bold uppercase tracking-tight"
                >
                  {customer.sizeNumber}
                </Badge>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border/50 bg-muted/30 p-6 shadow-inner ring-1 ring-inset ring-white/10">
            <div className="mb-4 flex items-center justify-between">
              <Label variant="dashboard">Measurements Profile</Label>
              <Badge variant="info" size="xs">
                SYNCED
              </Badge>
            </div>

            {measurementPreview.length === 0 ? (
              <p className="py-4 text-center text-xs text-muted-foreground">
                No bio-metric data recorded.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-x-8 gap-y-3.5">
                {measurementPreview.map((item) => (
                  <div
                    key={item.label}
                    className="group flex items-center justify-between"
                  >
                    <Label
                      variant="dashboard"
                      className="truncate pr-2 opacity-60 transition-opacity group-hover:opacity-100"
                    >
                      {item.label}
                    </Label>
                    <span className="shrink-0 text-xs font-bold tabular-nums text-foreground">
                      {item.value}&quot;
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
