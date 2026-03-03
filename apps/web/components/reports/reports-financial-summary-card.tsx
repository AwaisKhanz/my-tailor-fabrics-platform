import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { formatPKR } from "@/lib/utils";

interface ReportsFinancialSummaryCardProps {
  totalDesignRevenue: number;
  totalAddonRevenue: number;
}

export function ReportsFinancialSummaryCard({
  totalDesignRevenue,
  totalAddonRevenue,
}: ReportsFinancialSummaryCardProps) {
  const combinedRevenue = totalDesignRevenue + totalAddonRevenue;

  return (
    <Card variant="premium">
      <CardContent
        spacing="section"
        className="flex flex-col items-center justify-around gap-8 md:flex-row"
      >
        <div className="space-y-1 text-center">
          <Typography as="p" variant="muted">
            Design Gross
          </Typography>
          <Typography as="p" variant="statValue" className="text-3xl">
            {formatPKR(totalDesignRevenue)}
          </Typography>
          <Badge variant="outline" size="xs">
            Service Fees
          </Badge>
        </div>

        <div className="hidden h-12 w-px bg-border md:block" />

        <div className="space-y-1 text-center">
          <Typography as="p" variant="muted">
            Addon Gross
          </Typography>
          <Typography as="p" variant="statValue" className="text-3xl text-ready">
            {formatPKR(totalAddonRevenue)}
          </Typography>
          <Badge variant="outline" size="xs">
            Manual Charges
          </Badge>
        </div>

        <div className="hidden h-12 w-px bg-border md:block" />

        <div className="space-y-1 text-center">
          <Typography as="p" variant="muted">
            Combined Premium
          </Typography>
          <Typography as="p" variant="statValue" className="text-4xl text-primary">
            {formatPKR(combinedRevenue)}
          </Typography>
          <Typography as="p" variant="muted" className="font-semibold lowercase text-primary/80">
            selected range total
          </Typography>
        </div>
      </CardContent>
    </Card>
  );
}
