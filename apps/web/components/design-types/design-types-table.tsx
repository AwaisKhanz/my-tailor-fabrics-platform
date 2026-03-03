import { useMemo } from "react";
import { Edit2, GitBranch, Trash2 } from "lucide-react";
import { type Branch, type DesignType, type GarmentType } from "@tbms/shared-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { formatPKR } from "@/lib/utils";

interface DesignTypesTableProps {
  loading: boolean;
  designTypes: DesignType[];
  garmentTypes: GarmentType[];
  branches: Branch[];
  onEdit: (designType: DesignType) => void;
  onDelete: (designType: DesignType) => void;
}

export function DesignTypesTable({
  loading,
  designTypes,
  garmentTypes,
  branches,
  onEdit,
  onDelete,
}: DesignTypesTableProps) {
  const garmentNameById = useMemo(
    () => new Map(garmentTypes.map((garment) => [garment.id, garment.name])),
    [garmentTypes],
  );
  const branchById = useMemo(
    () => new Map(branches.map((branch) => [branch.id, branch])),
    [branches],
  );

  const columns = useMemo<ColumnDef<DesignType>[]>(
    () => [
      {
        header: "Name",
        cell: (designType) => <div className="font-bold text-foreground">{designType.name}</div>,
      },
      {
        header: "Application",
        cell: (designType) =>
          designType.garmentTypeId ? (
            <span className="text-xs font-medium">
              {garmentNameById.get(designType.garmentTypeId) || "Garment"}
            </span>
          ) : (
            <Badge variant="default" size="xs">
              Universal
            </Badge>
          ),
      },
      {
        header: "Branch",
        cell: (designType) =>
          designType.branchId ? (
            <Badge variant="outline" size="xs" className="gap-1">
              <GitBranch className="h-2.5 w-2.5" />
              {branchById.get(designType.branchId)?.code || "Branch"}
            </Badge>
          ) : (
            <Badge variant="info" size="xs">
              Global
            </Badge>
          ),
      },
      {
        header: "Customer Price",
        align: "right",
        cell: (designType) => <span className="font-bold">{formatPKR(designType.defaultPrice)}</span>,
      },
      {
        header: "Worker Rate",
        align: "right",
        cell: (designType) => (
          <span className="font-bold text-ready">{formatPKR(designType.defaultRate)}</span>
        ),
      },
      {
        header: "Actions",
        align: "right",
        cell: (designType) => (
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(designType)}>
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={() => onDelete(designType)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [branchById, garmentNameById, onDelete, onEdit],
  );

  return (
    <DataTable
      columns={columns}
      data={designTypes}
      loading={loading}
      itemLabel="design types"
      emptyMessage="No design types have been defined yet."
    />
  );
}
