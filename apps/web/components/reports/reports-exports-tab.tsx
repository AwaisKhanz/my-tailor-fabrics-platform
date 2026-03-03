import { FileText } from "lucide-react";
import { Typography } from "@/components/ui/typography";
import { ReportsExportGrid } from "@/components/reports/reports-export-grid";
import { ReportsWeeklyPrintCard } from "@/components/reports/reports-weekly-print-card";
import type { ReportExportType } from "@/hooks/use-reports-workspace";

interface ReportsExportsTabProps {
  exportingKey: string | null;
  printingWeekly: boolean;
  onExport: (type: ReportExportType, format: "pdf" | "excel") => void;
  onPrint: () => void;
}

export function ReportsExportsTab({
  exportingKey,
  printingWeekly,
  onExport,
  onPrint,
}: ReportsExportsTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 px-1">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
          <FileText className="h-4 w-4 text-primary" />
        </div>
        <Typography as="h2" variant="sectionTitle">
          Document Exports
        </Typography>
      </div>

      <ReportsExportGrid exportingKey={exportingKey} onExport={onExport} />
      <ReportsWeeklyPrintCard printing={printingWeekly} onPrint={onPrint} />
    </div>
  );
}
