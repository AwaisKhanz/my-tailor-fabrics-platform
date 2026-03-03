import { Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ReportsDateRangeCardProps {
  from: string;
  to: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
}

export function ReportsDateRangeCard({
  from,
  to,
  onFromChange,
  onToChange,
}: ReportsDateRangeCardProps) {
  return (
    <Card variant="premium">
      <CardHeader variant="section">
        <CardTitle variant="dashboard" className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          Reports Timeframe
        </CardTitle>
        <CardDescription className="text-xs">
          Adjust dates to recalculate metrics across the entire dashboard.
        </CardDescription>
      </CardHeader>

      <CardContent spacing="section" className="flex flex-col gap-6 sm:flex-row">
        <div className="flex-1 space-y-2">
          <Label variant="dashboard">Start Date</Label>
          <Input
            variant="premium"
            type="date"
            value={from}
            onChange={(event) => onFromChange(event.target.value)}
            className="h-11 font-bold"
          />
        </div>

        <div className="flex-1 space-y-2">
          <Label variant="dashboard">End Date</Label>
          <Input
            type="date"
            variant="premium"
            value={to}
            onChange={(event) => onToChange(event.target.value)}
            className="h-11 font-bold"
          />
        </div>
      </CardContent>
    </Card>
  );
}
