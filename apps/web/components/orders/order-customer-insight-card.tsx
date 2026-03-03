import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { UserRound } from "lucide-react";
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
    .slice(0, 10);
}

export function OrderCustomerInsightCard({
  customer,
}: OrderCustomerInsightCardProps) {
  const measurementPreview = getMeasurementPreview(customer);

  return (
    <Card className="overflow-hidden border-border/70 bg-card shadow-sm">
      <CardHeader variant="rowSection" density="comfortable" className="items-start sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
            <UserRound className="h-4 w-4 text-primary" />
          </div>
          <div>
            <CardTitle variant="dashboard">Customer Profile</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">Contact details and saved measurements.</p>
          </div>
        </div>
        <Badge variant="outline" size="xs" className="font-bold uppercase tracking-[0.08em]">
          {customer.sizeNumber}
        </Badge>
      </CardHeader>

      <CardContent spacing="section" className="space-y-5 p-5 sm:p-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border border-border/70 bg-background/50 px-3 py-2.5">
            <Label className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">Full Name</Label>
            <p className="mt-1 text-sm font-semibold text-foreground">{customer.fullName}</p>
          </div>
          <div className="rounded-lg border border-border/70 bg-background/50 px-3 py-2.5">
            <Label className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">Phone</Label>
            <p className="mt-1 text-sm font-semibold text-foreground">{customer.phone || "-"}</p>
          </div>
          <div className="rounded-lg border border-border/70 bg-background/50 px-3 py-2.5">
            <Label className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">City</Label>
            <p className="mt-1 text-sm font-semibold text-foreground">{customer.city || "-"}</p>
          </div>
        </div>

        <div className="rounded-lg border border-border/70 bg-muted/20 p-4">
          <div className="mb-3 flex items-center justify-between">
            <Label className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
              Measurement Snapshot
            </Label>
            <Badge variant="info" size="xs" className="font-bold uppercase tracking-[0.08em]">
              Synced
            </Badge>
          </div>

          {measurementPreview.length === 0 ? (
            <p className="py-4 text-center text-xs text-muted-foreground">
              No measurements available for this customer.
            </p>
          ) : (
            <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
              {measurementPreview.map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-3">
                  <span className="truncate text-xs text-muted-foreground">{item.label}</span>
                  <span className="shrink-0 text-xs font-semibold tabular-nums text-foreground">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
