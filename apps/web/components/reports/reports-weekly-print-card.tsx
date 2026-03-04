import { FileText, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionIcon } from "@/components/ui/section-icon";

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
    <Card variant="premium">
      <CardHeader variant="rowSection" align="startResponsive" gap="md">
        <div>
          <CardTitle variant="section">
            Production Work-Order Summary
          </CardTitle>
          <CardDescription variant="header">
            Optimized for physical printing and shift-based task management.
          </CardDescription>
        </div>
        <SectionIcon size="lg">
          <Printer className="h-4 w-4" />
        </SectionIcon>
      </CardHeader>

      <CardContent spacing="section">
        <Button
          variant="premium"
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
