import { ChevronRight, Loader2 } from "lucide-react";
import { OrderStatus } from "@tbms/shared-types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface OrderLifecycleCardProps {
  status: OrderStatus;
  statusLoading: boolean;
  onAdvance: (status: OrderStatus) => void;
}

export function OrderLifecycleCard({
  status,
  statusLoading,
  onAdvance,
}: OrderLifecycleCardProps) {
  if (status === OrderStatus.CANCELLED || status === OrderStatus.COMPLETED) {
    return null;
  }

  return (
    <Card className="overflow-hidden border-border shadow-sm">
      <CardHeader variant="section" density="compact" className="items-center pb-2">
        <CardTitle className="text-center text-[10px] font-bold uppercase tracking-tight text-muted-foreground opacity-50">
          Lifecycle Advancement
        </CardTitle>
      </CardHeader>

      <CardContent spacing="compact" className="space-y-3 pt-3">
        {status === OrderStatus.NEW ? (
          <Button
            variant="premium"
            size="lg"
            className="w-full shadow-lg shadow-primary/20"
            onClick={() => onAdvance(OrderStatus.IN_PROGRESS)}
            disabled={statusLoading}
          >
            {statusLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ChevronRight className="mr-2 h-4 w-4" />
            )}
            Begin Production
          </Button>
        ) : null}

        {status === OrderStatus.IN_PROGRESS ? (
          <Button
            className="h-12 w-full bg-foreground text-[10px] font-bold uppercase tracking-tight text-background hover:bg-foreground/90"
            onClick={() => onAdvance(OrderStatus.READY)}
            disabled={statusLoading}
          >
            Mark Ready for trial
          </Button>
        ) : null}

        {status === OrderStatus.READY ? (
          <Button
            className="h-12 w-full border-primary/20 text-[10px] font-bold uppercase tracking-tight text-primary hover:bg-primary/5"
            variant="outline"
            onClick={() => onAdvance(OrderStatus.DELIVERED)}
            disabled={statusLoading}
          >
            Dispatch Piece
          </Button>
        ) : null}

        {status === OrderStatus.DELIVERED ? (
          <Button
            className="h-12 w-full text-[10px] font-bold uppercase tracking-tight shadow-xl"
            variant="premium"
            onClick={() => onAdvance(OrderStatus.COMPLETED)}
            disabled={statusLoading}
          >
            Seal Order
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
