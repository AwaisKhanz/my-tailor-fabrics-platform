import { Order, type MeasurementValues } from "@tbms/shared-types";
import { Badge } from "@tbms/ui/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@tbms/ui/components/card";
import { Label } from "@tbms/ui/components/label";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@tbms/ui/components/table";
import { cn } from "@/lib/utils";

interface MeasurementDisplayItem {
  label: string;
  value: string;
}

interface OrderCustomerInsightCardProps {
  customer: Order["customer"];
  className?: string;
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
  className,
}: OrderCustomerInsightCardProps) {
  const measurementPreview = getMeasurementPreview(customer);

  return (
    <Card className={cn(className)}>
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>Customer Profile</CardTitle>
            <CardDescription className="mt-1">
              Contact details and saved measurements.
            </CardDescription>
          </div>
          <Badge variant="outline">{customer.sizeNumber}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-md border p-3">
            <Label className="text-xs text-muted-foreground">Full Name</Label>
            <p className="mt-1 text-sm font-medium text-foreground">
              {customer.fullName}
            </p>
          </div>
          <div className="rounded-md border p-3">
            <Label className="text-xs text-muted-foreground">Phone</Label>
            <p className="mt-1 text-sm font-medium text-foreground">
              {customer.phone || "-"}
            </p>
          </div>
          <div className="rounded-md border p-3">
            <Label className="text-xs text-muted-foreground">City</Label>
            <p className="mt-1 text-sm font-medium text-foreground">
              {customer.city || "-"}
            </p>
          </div>
        </div>

        <div className="rounded-md border ">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div>
              <h4 className="text-sm font-mediu">Measurement Snapshot</h4>
              <p className="text-xs text-muted-foreground">
                Latest captured values for this customer.
              </p>
            </div>
            <Badge variant="secondary">Synced</Badge>
          </div>

          {measurementPreview.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
              No measurements available for this customer.
            </p>
          ) : (
            <Table>
              <TableBody>
                {measurementPreview.map((item) => (
                  <TableRow key={item.label}>
                    <TableCell className="text-sm text-muted-foreground">
                      {item.label}
                    </TableCell>
                    <TableCell className="text-right text-sm font-medium">
                      {item.value}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
