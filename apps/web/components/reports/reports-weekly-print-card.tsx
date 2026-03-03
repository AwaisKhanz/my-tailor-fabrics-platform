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
    <Card className="overflow-hidden border-border/70 bg-card/95">
      <CardHeader variant="rowSection" className="items-start gap-4 sm:items-center">
        <div>
          <CardTitle className="text-base font-semibold tracking-tight">
            Production Work-Order Summary
          </CardTitle>
          <CardDescription className="mt-1 text-xs">
            Optimized for physical printing and shift-based task management.
          </CardDescription>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
          <Printer className="h-4 w-4" />
        </div>
      </CardHeader>

      <CardContent spacing="section">
        <Button variant="premium" className="w-full" size="lg" onClick={onPrint} disabled={printing}>
          <FileText className="mr-2 h-4 w-4" />
          {printing ? "Generating..." : "Generate Print View"}
        </Button>
      </CardContent>
    </Card>
  );
}
