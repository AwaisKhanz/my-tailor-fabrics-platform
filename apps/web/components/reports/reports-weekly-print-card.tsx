import { FileText, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
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
    <Card variant="elevatedPanel">
      <CardHeader variant="rowSection" align="startResponsive" gap="md">
        <SectionHeader
          title="Production Work-Order Summary"
          description="Optimized for physical printing and shift-based task management."
          icon={
            <SectionIcon size="lg">
              <Printer className="h-4 w-4" />
            </SectionIcon>
          }
        />
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
