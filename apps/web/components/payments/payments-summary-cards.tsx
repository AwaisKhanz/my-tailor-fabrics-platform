import { Banknote } from "lucide-react";
import { type PaymentSummary } from "@tbms/shared-types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Typography } from "@/components/ui/typography";
import { formatPKR } from "@/lib/utils";

interface PaymentsSummaryCardsProps {
  loading: boolean;
  summary: PaymentSummary | null;
  currentBalance: number;
  canDisburse: boolean;
  onDisburse: () => void;
}

export function PaymentsSummaryCards({
  loading,
  summary,
  currentBalance,
  canDisburse,
  onDisburse,
}: PaymentsSummaryCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <Skeleton key={item} className="h-32 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
      <Card className="overflow-hidden border-border/50 border-l-4 border-l-success shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between bg-muted/5 pb-2">
          <CardTitle variant="dashboard">Total Earned</CardTitle>
          <Banknote className="h-4 w-4 text-success" />
        </CardHeader>
        <CardContent className="pt-4">
          <Typography as="p" variant="statValue" className="text-success">
            {formatPKR(summary.totalEarned)}
          </Typography>
          <Label variant="dashboard" className="mt-1">
            All lifecycle steps
          </Label>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-border/50 border-l-4 border-l-primary shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between bg-muted/5 pb-2">
          <CardTitle variant="dashboard">Total Paid</CardTitle>
          <Banknote className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent className="pt-4">
          <Typography as="p" variant="statValue" className="text-primary">
            {formatPKR(summary.totalPaid)}
          </Typography>
          <Label variant="dashboard" className="mt-1">
            Settled disbursements
          </Label>
        </CardContent>
      </Card>

      <Card
        className={`overflow-hidden border-border/50 border-l-4 shadow-sm ${
          currentBalance > 0 ? "border-l-warning bg-warning/5" : "border-l-muted"
        }`}
      >
        <CardHeader className="flex flex-row items-center justify-between bg-muted/5 pb-2">
          <CardTitle variant="dashboard">Outstanding Balance</CardTitle>
          <Banknote className="h-4 w-4 text-warning" />
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between gap-3">
            <Typography
              as="p"
              variant="statValue"
              className={currentBalance > 0 ? "text-warning" : "text-muted-foreground opacity-40"}
            >
              {formatPKR(currentBalance)}
            </Typography>

            {canDisburse ? (
              <Button variant="premium" size="xs" className="h-8" onClick={onDisburse}>
                Disburse
              </Button>
            ) : null}
          </div>
          <Label variant="dashboard" className="mt-1">
            Payable amount
          </Label>
        </CardContent>
      </Card>
    </div>
  );
}
