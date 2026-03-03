import { FileDown, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { type ReportExportType } from "@/hooks/use-reports-page";

interface ExportCardConfig {
  type: ReportExportType;
  title: string;
  description: string;
}

interface ReportsExportGridProps {
  exportingKey: string | null;
  onExport: (type: ReportExportType, format: "pdf" | "excel") => void;
}

const EXPORT_CARDS: ExportCardConfig[] = [
  {
    type: "orders",
    title: "Order Ledger",
    description: "Financial summary of bookings, balances and fulfilment.",
  },
  {
    type: "payments",
    title: "Employee Payroll",
    description: "Karigar earning summaries and historical disbursement data.",
  },
  {
    type: "expenses",
    title: "Expense Audit",
    description: "Overhead and miscellaneous business spending logs.",
  },
];

export function ReportsExportGrid({
  exportingKey,
  onExport,
}: ReportsExportGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {EXPORT_CARDS.map((card) => {
        const excelKey = `${card.type}:excel`;
        const pdfKey = `${card.type}:pdf`;

        return (
          <Card key={card.type} variant="premium">
            <CardHeader>
              <CardTitle variant="dashboard">{card.title}</CardTitle>
              <CardDescription className="text-[11px] leading-relaxed">
                {card.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 font-bold"
                onClick={() => onExport(card.type, "excel")}
                disabled={Boolean(exportingKey)}
              >
                <FileDown className="mr-2 h-3 w-3" />
                {exportingKey === excelKey ? "Generating..." : "Excel"}
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="flex-1 font-bold"
                onClick={() => onExport(card.type, "pdf")}
                disabled={Boolean(exportingKey)}
              >
                <FileText className="mr-2 h-3 w-3" />
                {exportingKey === pdfKey ? "Generating..." : "PDF"}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
