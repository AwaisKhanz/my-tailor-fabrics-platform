import { Banknote, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Typography } from "@/components/ui/typography";
import { formatPKR } from "@/lib/utils";

interface EmployeeFinancialCardsProps {
  stats: {
    totalEarned: number;
    totalPaid: number;
    currentBalance: number;
  };
}

export function EmployeeFinancialCards({ stats }: EmployeeFinancialCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Card className="group border-border bg-card shadow-sm transition-colors hover:border-primary/50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <Label variant="dashboard">Lifetime Earned</Label>
              <Typography as="p" variant="statValue" className="mt-1">
                {formatPKR(stats.totalEarned)}
              </Typography>
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
              <Banknote className="h-5 w-5 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="group border-border bg-card shadow-sm transition-colors hover:border-success/50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <Label variant="dashboard">Total Paid Out</Label>
              <Typography as="p" variant="statValue" className="mt-1 text-success">
                {formatPKR(stats.totalPaid)}
              </Typography>
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success/10 transition-colors group-hover:bg-success/20">
              <CheckCircle2 className="h-5 w-5 text-success" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="group border-border bg-card shadow-sm transition-colors hover:border-warning/50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <Label variant="dashboard">Current Balance</Label>
              <Typography as="p" variant="statValue" className="mt-1 text-warning">
                {formatPKR(stats.currentBalance)}
              </Typography>
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-warning/10 transition-colors group-hover:bg-warning/20">
              <Banknote className="h-5 w-5 text-warning" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
