import { FileText, Printer } from "lucide-react";
import { Button } from "@tbms/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@tbms/ui/components/card";

interface ReportsWeeklyPrintCardProps {
  printing: boolean;
  onPrint: () => void;
  canExport?: boolean;
}

export function ReportsWeeklyPrintCard({
  printing,
  onPrint,
  canExport = true,
}: ReportsWeeklyPrintCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Printer className="h-4 w-4" />
          Production Work-Order Summary
        </CardTitle>
        <CardDescription>
          Optimized for physical printing and shift-based task management.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Button
          variant="default"
          className="w-full"
          size="lg"
          onClick={onPrint}
          disabled={printing || !canExport}
        >
          <FileText className="mr-2 h-4 w-4" />
          {printing ? "Generating..." : "Generate Print View"}
        </Button>
      </CardContent>
    </Card>
  );
}
