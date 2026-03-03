import { FileText, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ReportsWeeklyPrintCardProps {
  printing: boolean;
  onPrint: () => void;
}

export function ReportsWeeklyPrintCard({
  printing,
  onPrint,
}: ReportsWeeklyPrintCardProps) {
  return (
    <Card variant="premium">
      <CardHeader>
        <CardTitle variant="dashboard" className="flex items-center justify-between">
          Production Work-Order Summary
          <Printer className="h-4 w-4 text-primary" />
        </CardTitle>
        <CardDescription className="text-xs">
          Optimized for physical printing - used for shift-based task management.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Button variant="premium" className="w-full" size="lg" onClick={onPrint} disabled={printing}>
          <FileText className="mr-2 h-4 w-4" />
          {printing ? "Generating..." : "Generate Print View"}
        </Button>
      </CardContent>
    </Card>
  );
}
