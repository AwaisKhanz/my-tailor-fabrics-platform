import { FileText } from "lucide-react";
import { ReportsExportGrid } from "@/components/reports/reports-export-grid";
import { ReportsWeeklyPrintCard } from "@/components/reports/reports-weekly-print-card";
import { SectionHeader } from "@tbms/ui/components/section-header";
import type { ReportExportType } from "@/hooks/use-reports-workspace";

interface ReportsExportsTabProps {
  exportingKey: string | null;
  printingWeekly: boolean;
  onExport: (type: ReportExportType, format: "pdf" | "excel") => void;
  onPrint: () => void;
  canExport?: boolean;
}

export function ReportsExportsTab({
  exportingKey,
  printingWeekly,
  onExport,
  onPrint,
  canExport = true,
}: ReportsExportsTabProps) {
  return (
    <div className="space-y-4">
      <SectionHeader
        title="Document Exports"
        description="Generate structured reports for finance, payroll, and operational review."
        icon={<FileText className="h-4 w-4 text-primary" />}
      />

      <ReportsExportGrid
        exportingKey={exportingKey}
        onExport={onExport}
        canExport={canExport}
      />
      <ReportsWeeklyPrintCard
        printing={printingWeekly}
        onPrint={onPrint}
        canExport={canExport}
      />
    </div>
  );
}
