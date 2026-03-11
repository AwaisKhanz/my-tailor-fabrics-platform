import { CalendarDays, Edit2, MapPin, Phone } from "lucide-react";
import { type Customer } from "@tbms/shared-types";
import {
  CUSTOMER_STATUS_BADGE,
  CUSTOMER_STATUS_LABELS,
} from "@tbms/shared-constants";
import { Badge } from "@tbms/ui/components/badge";
import { Button } from "@tbms/ui/components/button";
import { Card, CardContent } from "@tbms/ui/components/card";
import { Label } from "@tbms/ui/components/label";
import { MetaPill } from "@tbms/ui/components/meta-pill";
import { Heading } from "@tbms/ui/components/typography";

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
    <Card>
      <CardContent className="space-y-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <Label className="text-xs font-semibold uppercase  text-muted-foreground">
              Customer Command
            </Label>

            <div className="flex flex-wrap items-center gap-3">
              <Heading
                as="h1"
                variant="page"
                className="font-semibold sm:text-4xl"
              >
                {customer.fullName}
              </Heading>
              <Badge
                variant={CUSTOMER_STATUS_BADGE[customer.status] ?? "outline"}
                className="px-2.5 py-1 text-xs font-bold uppercase "
              >
                {CUSTOMER_STATUS_LABELS[customer.status] ?? customer.status}
              </Badge>
              <Badge variant="outline" className="font-semibold">
                {customer.sizeNumber}
              </Badge>
            </div>

            <div className="flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:gap-3">
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
              <Button
                variant="default"
                size="lg"
                className="w-full justify-center sm:w-auto sm:min-w-[180px]"
                onClick={onEdit}
              >
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
