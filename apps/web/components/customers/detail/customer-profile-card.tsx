import { Banknote, MapPin, Phone, ShoppingBag, UserSquare2 } from "lucide-react";
import { type Customer } from "@tbms/shared-types";
import { CUSTOMER_STATUS_BADGE, CUSTOMER_STATUS_LABELS } from "@tbms/shared-constants";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Typography } from "@/components/ui/typography";
import { formatPKR } from "@/lib/utils";

interface CustomerProfileCardProps {
  customer: Customer;
}

export function CustomerProfileCard({ customer }: CustomerProfileCardProps) {
  const addressLine = [customer.address, customer.city].filter(Boolean).join(", ");

  return (
    <Card className="overflow-hidden border-border/70 bg-card/95 shadow-sm">
      <CardHeader variant="rowSection" className="items-start sm:items-center">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
            <UserSquare2 className="h-4 w-4" />
          </div>
          <CardTitle className="text-base font-semibold tracking-tight">Customer Profile</CardTitle>
        </div>
        <Badge variant={CUSTOMER_STATUS_BADGE[customer.status] ?? "outline"} size="xs">
          {CUSTOMER_STATUS_LABELS[customer.status] ?? customer.status}
        </Badge>
      </CardHeader>

      <CardContent spacing="section" className="space-y-4 p-5 sm:p-6">
        <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5">
          <Label className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">Size Number</Label>
          <p className="mt-1 text-sm font-semibold text-foreground">{customer.sizeNumber}</p>
        </div>

        <div className="flex items-center gap-3 text-sm">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <span>{customer.phone}</span>
        </div>

        {customer.whatsapp ? (
          <div className="flex items-center gap-3 text-sm">
            <Phone className="h-4 w-4 text-success" />
            <span>{customer.whatsapp} (WhatsApp)</span>
          </div>
        ) : null}

        <div className="flex items-start gap-3 text-sm">
          <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
          <span>{addressLine || "No address added yet"}</span>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t pt-4">
          <div>
            <Label variant="dashboard" className="mb-1">
              Total Orders
            </Label>
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-primary" />
              <Typography as="p" variant="sectionTitle" className="text-base">
                {customer.stats?.totalOrders || 0}
              </Typography>
            </div>
          </div>

          <div>
            <Label variant="dashboard" className="mb-1">
              Total Spent
            </Label>
            <div className="flex items-center gap-2">
              <Banknote className="h-4 w-4 text-success" />
              <Typography as="p" variant="sectionTitle" className="text-base">
                {formatPKR(customer.stats?.totalSpent || 0)}
              </Typography>
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <Label variant="dashboard" className="mb-1">
            Account Type
          </Label>
          <Badge variant={customer.isVip ? "warning" : "secondary"} size="xs">
            {customer.isVip ? "VIP" : "Standard"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
