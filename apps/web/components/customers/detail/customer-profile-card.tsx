import {
  Banknote,
  MapPin,
  Phone,
  ShoppingBag,
  UserSquare2,
} from "lucide-react";
import { type Customer } from "@tbms/shared-types";
import {
  CUSTOMER_STATUS_BADGE,
  CUSTOMER_STATUS_LABELS,
} from "@tbms/shared-constants";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { InfoTile } from "@/components/ui/info-tile";
import { Label } from "@/components/ui/label";
import { SectionHeader } from "@/components/ui/section-header";
import { SectionIcon } from "@/components/ui/section-icon";
import { Typography } from "@/components/ui/typography";
import { formatPKR } from "@/lib/utils";

interface CustomerProfileCardProps {
  customer: Customer;
}

export function CustomerProfileCard({ customer }: CustomerProfileCardProps) {
  const addressLine = [customer.address, customer.city]
    .filter(Boolean)
    .join(", ");

  return (
    <Card variant="elevatedPanel">
      <CardHeader variant="rowSection" align="startResponsive">
        <SectionHeader
          title="Customer Profile"
          icon={
            <SectionIcon tone="infoSoft">
              <UserSquare2 className="h-4 w-4" />
            </SectionIcon>
          }
        />
        <Badge
          variant={CUSTOMER_STATUS_BADGE[customer.status] ?? "outline"}
          size="xs"
        >
          {CUSTOMER_STATUS_LABELS[customer.status] ?? customer.status}
        </Badge>
      </CardHeader>

      <CardContent spacing="section" padding="inset" className="space-y-4">
        <InfoTile tone="elevatedSoft">
          <Label variant="micro">Size Number</Label>
          <p className="mt-1 text-sm font-semibold text-text-primary">
            {customer.sizeNumber}
          </p>
        </InfoTile>

        <div className="flex items-center gap-3 text-sm">
          <Phone className="h-4 w-4 text-text-secondary" />
          <span>{customer.phone}</span>
        </div>

        {customer.whatsapp ? (
          <div className="flex items-center gap-3 text-sm">
            <Phone className="h-4 w-4 text-success" />
            <span>{customer.whatsapp} (WhatsApp)</span>
          </div>
        ) : null}

        <div className="flex items-start gap-3 text-sm">
          <MapPin className="mt-0.5 h-4 w-4 text-text-secondary" />
          <span>{addressLine || "No address added yet"}</span>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-divider pt-4">
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

        <div className="border-t flex justify-between items-center border-divider pt-4">
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
