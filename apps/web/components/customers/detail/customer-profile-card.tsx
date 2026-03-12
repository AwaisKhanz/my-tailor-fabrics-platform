import {
  Banknote,
  MapPin,
  Phone,
  ShoppingBag,
} from "lucide-react";
import { type Customer } from "@tbms/shared-types";
import {
  CUSTOMER_STATUS_BADGE,
  CUSTOMER_STATUS_LABELS,
} from "@tbms/shared-constants";
import { Badge } from "@tbms/ui/components/badge";
import { Card, CardContent, CardHeader } from "@tbms/ui/components/card";
import { FieldLabel } from "@tbms/ui/components/field";
import { InfoTile } from "@tbms/ui/components/info-tile";
import { SectionHeader } from "@tbms/ui/components/section-header";
import { Heading } from "@tbms/ui/components/typography";
import { formatPKR } from "@/lib/utils";

interface CustomerProfileCardProps {
  customer: Customer;
}

export function CustomerProfileCard({ customer }: CustomerProfileCardProps) {
  const addressLine = [customer.address, customer.city]
    .filter(Boolean)
    .join(", ");

  return (
    <Card>
      <CardHeader className="flex justify-between items-start w-full">
        <SectionHeader
          title="Customer Profile"
          description="Key details and insights about the customer."
        />
        <Badge variant={CUSTOMER_STATUS_BADGE[customer.status] ?? "outline"}>
          {CUSTOMER_STATUS_LABELS[customer.status] ?? customer.status}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-4">
        <InfoTile tone="secondary">
          <FieldLabel size="compact">Size Number</FieldLabel>
          <p className="mt-1 text-sm font-semibold text-foreground">
            {customer.sizeNumber}
          </p>
        </InfoTile>

        <div className="flex items-center gap-3 text-sm">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <span>{customer.phone}</span>
        </div>

        {customer.whatsapp ? (
          <div className="flex items-center gap-3 text-sm">
            <Phone className="h-4 w-4 text-primary" />
            <span>{customer.whatsapp} (WhatsApp)</span>
          </div>
        ) : null}

        <div className="flex items-start gap-3 text-sm">
          <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
          <span>{addressLine || "No address added yet"}</span>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
          <div>
            <FieldLabel className="mb-1">Total Orders</FieldLabel>
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-primary" />
              <Heading as="div" variant="section" className="text-base">
                {customer.stats?.totalOrders || 0}
              </Heading>
            </div>
          </div>

          <div>
            <FieldLabel className="mb-1">Total Spent</FieldLabel>
            <div className="flex items-center gap-2">
              <Banknote className="h-4 w-4 text-primary" />
              <Heading as="div" variant="section" className="text-base">
                {formatPKR(customer.stats?.totalSpent || 0)}
              </Heading>
            </div>
          </div>
        </div>

        <div className="border-t flex justify-between items-center border-border pt-4">
          <FieldLabel className="mb-1">Account Type</FieldLabel>
          <Badge variant={customer.isVip ? "secondary" : "secondary"}>
            {customer.isVip ? "VIP" : "Standard"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
