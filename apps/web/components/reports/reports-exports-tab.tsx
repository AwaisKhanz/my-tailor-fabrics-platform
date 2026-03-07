import { FileText } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { SectionIcon } from "@/components/ui/section-icon";
import { ReportsExportGrid } from "@/components/reports/reports-export-grid";
import { ReportsWeeklyPrintCard } from "@/components/reports/reports-weekly-print-card";
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
        className="px-1"
        title="Document Exports"
        titleClassName="text-[1.125rem] font-bold"
        icon={
          <SectionIcon framed={false} className="rounded-xl">
            <FileText className="h-4 w-4 text-primary" />
          </SectionIcon>
        }
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
