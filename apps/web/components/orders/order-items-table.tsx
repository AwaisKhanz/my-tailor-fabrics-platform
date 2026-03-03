import { useMemo } from "react";
import { Scissors } from "lucide-react";
import { OrderItem } from "@tbms/shared-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { formatPKR } from "@/lib/utils";

interface EmployeeOption {
  id: string;
  fullName: string;
}

interface OrderItemsTableProps {
  items: OrderItem[];
  employees: EmployeeOption[];
  onManageTasks: (item: OrderItem) => void;
}

export function OrderItemsTable({
  items,
  employees,
  onManageTasks,
}: OrderItemsTableProps) {
  const employeeMap = useMemo(
    () => new Map(employees.map((employee) => [employee.id, employee.fullName])),
    [employees],
  );

  const columns: ColumnDef<OrderItem>[] = [
    {
      header: "Piece #",
      cell: (item) => (
        <span className="font-bold text-foreground">#{item.pieceNo}</span>
      ),
    },
    {
      header: "Garment Type",
      cell: (item) => (
        <div className="flex items-center gap-2">
          <Scissors className="h-3.5 w-3.5 text-muted-foreground opacity-50" />
          <div className="flex flex-col">
            <span className="font-bold text-foreground">{item.garmentTypeName}</span>
            {item.designType ? (
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                {item.designType.name}
              </span>
            ) : null}
          </div>
        </div>
      ),
    },
    {
      header: "Production Tasks",
      cell: (item) => {
        const employeeName = item.employeeId
          ? employeeMap.get(item.employeeId) ?? item.employeeId
          : "—";
        const initials =
          employeeName !== "—"
            ? employeeName
                .split(" ")
                .map((part) => part[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)
            : "—";

        if (item.tasks && item.tasks.length > 0) {
          return (
            <div className="min-w-[180px]">
              <Button
                variant="outline"
                size="sm"
                className="h-8 border-primary/20 bg-primary/5 text-[10px] font-bold uppercase tracking-widest text-primary transition-all hover:bg-primary/5 hover:text-primary"
                onClick={() => onManageTasks(item)}
              >
                Manage Tasks
              </Button>
            </div>
          );
        }

        if (employeeName === "—") {
          return (
            <div className="min-w-[180px]">
              <span className="text-xs text-muted-foreground">Unassigned</span>
            </div>
          );
        }

        return (
          <div className="min-w-[180px]">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-[10px] font-bold text-primary">
                {initials}
              </div>
              <span className="text-sm font-bold text-muted-foreground">
                {employeeName}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      header: "Description",
      cell: (item) => (
        <div className="space-y-1">
          <p className="max-w-[200px] truncate text-xs leading-relaxed text-muted-foreground">
            {item.description || "—"}
          </p>
          {item.addons && item.addons.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {item.addons.map((addon, index) => (
                <Badge
                  key={`${addon.name}-${index}`}
                  variant="outline"
                  className="h-4 border-dashed px-1 text-[8px]"
                >
                  {addon.name}: +{formatPKR(addon.price)}
                </Badge>
              ))}
            </div>
          ) : null}
        </div>
      ),
    },
    {
      header: "Fabric",
      align: "center",
      cell: (item) => (
        <Badge
          variant="royal"
          className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-tight"
        >
          {item.fabricSource}
        </Badge>
      ),
    },
    {
      header: "Unit Price",
      align: "right",
      cell: (item) => (
        <span className="text-xs text-muted-foreground">
          {formatPKR(item.unitPrice)}
        </span>
      ),
    },
    {
      header: "Total",
      align: "right",
      cell: (item) => {
        const addonsTotal = (item.addons || []).reduce(
          (total, addon) => total + addon.price,
          0,
        );
        const designPrice = item.designType?.defaultPrice || 0;
        const total =
          item.unitPrice * item.quantity +
          designPrice * item.quantity +
          addonsTotal;

        return (
          <div className="flex flex-col items-end">
            <span className="font-bold text-foreground">{formatPKR(total)}</span>
            {addonsTotal > 0 || designPrice > 0 ? (
              <span className="text-[9px] text-muted-foreground">
                {designPrice > 0 ? `Incl. ${formatPKR(designPrice)} design` : ""}
                {addonsTotal > 0
                  ? `${designPrice > 0 ? " & " : "Incl. "}${formatPKR(addonsTotal)} addons`
                  : ""}
              </span>
            ) : null}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <CardTitle variant="dashboard">Hardware / Garment Pieces</CardTitle>
          <Badge variant="secondary" size="xs">
            {items.length} UNITS
          </Badge>
        </div>
      </div>
      <Card className="overflow-hidden border-border shadow-sm">
        <DataTable
          columns={columns}
          data={items}
          itemLabel="pieces"
          emptyMessage="No pieces found for this order."
          chrome="flat"
        />
      </Card>
    </div>
  );
}
