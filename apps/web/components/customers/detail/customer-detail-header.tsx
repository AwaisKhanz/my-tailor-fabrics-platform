import { CalendarDays, Edit2, MapPin, Phone } from "lucide-react";
import { type Customer } from "@tbms/shared-types";
import { CUSTOMER_STATUS_BADGE, CUSTOMER_STATUS_LABELS } from "@tbms/shared-constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface CustomerDetailHeaderProps {
  customer: Customer;
  onEdit: () => void;
  canEditProfile?: boolean;
}

export function CustomerDetailHeader({
  customer,
  onEdit,
  canEditProfile = true,
}: CustomerDetailHeaderProps) {
  const createdAtLabel = new Date(customer.createdAt).toLocaleDateString();

  return (
    <Card className="overflow-hidden border-border/70 bg-card shadow-sm">
      <CardContent spacing="section" className="space-y-6 p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <Label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Customer Command
            </Label>

            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {customer.fullName}
              </h1>
              <Badge
                variant={CUSTOMER_STATUS_BADGE[customer.status] ?? "outline"}
                className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em]"
              >
                {CUSTOMER_STATUS_LABELS[customer.status] ?? customer.status}
              </Badge>
              <Badge variant="outline" size="xs" className="font-semibold">
                {customer.sizeNumber}
              </Badge>
            </div>

            <div className="flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:gap-3">
              <div className="inline-flex items-center gap-1.5 rounded-md border border-border/70 bg-muted/20 px-2.5 py-1.5">
                <Phone className="h-3.5 w-3.5" />
                <span>{customer.phone}</span>
              </div>
              {customer.city ? (
                <div className="inline-flex items-center gap-1.5 rounded-md border border-border/70 bg-muted/20 px-2.5 py-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{customer.city}</span>
                </div>
              ) : null}
              <div className="inline-flex items-center gap-1.5 rounded-md border border-border/70 bg-muted/20 px-2.5 py-1.5">
                <CalendarDays className="h-3.5 w-3.5" />
                <span>Customer since {createdAtLabel}</span>
              </div>
            </div>
          </div>

          {canEditProfile ? (
            <div className="flex w-full justify-start lg:w-auto lg:justify-end">
              <Button variant="premium" size="lg" className="w-full justify-center sm:w-auto sm:min-w-[180px]" onClick={onEdit}>
                <Edit2 className="h-4 w-4" />
                Edit Profile
              </Button>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
