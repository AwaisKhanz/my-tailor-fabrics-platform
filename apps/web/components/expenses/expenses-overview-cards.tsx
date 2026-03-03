import { ReceiptText, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Typography } from "@/components/ui/typography";
import { formatPKR } from "@/lib/utils";

interface ExpensesOverviewCardsProps {
  listedAmount: number;
  listedCount: number;
  totalCount: number;
}

export function ExpensesOverviewCards({
  listedAmount,
  listedCount,
  totalCount,
}: ExpensesOverviewCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-1">
      <Card className="overflow-hidden border-border/50 shadow-sm">
        <CardHeader variant="rowSection" density="compact">
          <div className="flex items-center justify-between">
            <CardTitle variant="dashboard">Page Spend</CardTitle>
            <Wallet className="h-4 w-4 text-destructive" />
          </div>
        </CardHeader>
        <CardContent spacing="section">
          <Typography as="p" variant="statValue" className="text-destructive">
            {formatPKR(listedAmount)}
          </Typography>
          <Label variant="dashboard" className="mt-1">
            visible on current page
          </Label>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-border/50 shadow-sm">
        <CardHeader variant="rowSection" density="compact">
          <div className="flex items-center justify-between">
            <CardTitle variant="dashboard">Records</CardTitle>
            <ReceiptText className="h-4 w-4 text-primary" />
          </div>
        </CardHeader>
        <CardContent spacing="section">
          <Typography as="p" variant="statValue" className="text-primary">
            {listedCount}
          </Typography>
          <Label variant="dashboard" className="mt-1">
            of {totalCount} total matching records
          </Label>
        </CardContent>
      </Card>
    </div>
  );
}
