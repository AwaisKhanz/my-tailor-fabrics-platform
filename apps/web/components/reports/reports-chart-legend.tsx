import { cn } from "@/lib/utils";

interface ReportsChartLegendItem {
  label: string;
  toneClassName: string;
}

interface ReportsChartLegendProps {
  items: ReportsChartLegendItem[];
  className?: string;
}

export function ReportsChartLegend({ items, className }: ReportsChartLegendProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2 text-xs text-text-secondary">
          <span className={cn("h-2.5 w-2.5 rounded-full", item.toneClassName)} />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}
