import { CalendarDays, Edit2, MapPin, Phone } from "lucide-react";
import { type Customer } from "@tbms/shared-types";
import { CUSTOMER_STATUS_BADGE, CUSTOMER_STATUS_LABELS } from "@tbms/shared-constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { MetaPill } from "@/components/ui/meta-pill";
import { Typography } from "@/components/ui/typography";

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
    <Card variant="premium">
      <CardContent spacing="section" padding="inset" className="space-y-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <Label variant="microStrong">
              Customer Command
            </Label>

            <div className="flex flex-wrap items-center gap-3">
              <Typography as="h1" variant="pageTitle" className="font-semibold sm:text-4xl">
                {customer.fullName}
              </Typography>
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

            <div className="flex flex-col gap-2 text-xs text-text-secondary sm:flex-row sm:items-center sm:gap-3">
              <MetaPill>
                <Phone className="h-3.5 w-3.5" />
                <span>{customer.phone}</span>
              </MetaPill>
              {customer.city ? (
                <MetaPill>
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{customer.city}</span>
                </MetaPill>
              ) : null}
              <MetaPill>
                <CalendarDays className="h-3.5 w-3.5" />
                <span>Customer since {createdAtLabel}</span>
              </MetaPill>
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
