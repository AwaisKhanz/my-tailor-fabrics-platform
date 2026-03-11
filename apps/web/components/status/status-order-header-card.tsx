import { type BadgeVariant, type Order } from "@tbms/shared-types";
import { Badge } from "@tbms/ui/components/badge";
import {
  Card,
  CardContent,
  CardHeader,
} from "@tbms/ui/components/card";
import { ProgressSteps } from "@tbms/ui/components/progress-steps";
import { Heading, Text } from "@tbms/ui/components/typography";
import { buildOrderProgressSteps } from "@/lib/order-progress-steps";

interface StatusOrderHeaderCardProps {
  order: Order;
  label: string;
  variant: BadgeVariant;
  icon: React.ElementType;
}

export function StatusOrderHeaderCard({
  order,
  label,
  variant,
  icon: Icon,
}: StatusOrderHeaderCardProps) {
  const progressSteps = buildOrderProgressSteps(order.status);

  return (
    <Card className="text-center">
      <CardHeader className="items-center pb-2">
        <Text variant="meta">Order Number</Text>
        <Heading as="h1" variant="section" className="text-2xl text-primary">
          {order.orderNumber}
        </Heading>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <div className="flex justify-center">
          <Badge
            variant={variant}
            className="h-7 px-3 text-sm uppercase"
          >
            <Icon className="mr-1.5 h-4 w-4" />
            {label}
          </Badge>
        </div>
        <ProgressSteps data={{ steps: progressSteps }} />
      </CardContent>
    </Card>
  );
}
