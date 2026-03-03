import { useMemo } from "react";
import Link from "next/link";
import { Ban, CheckCircle, LayoutDashboard, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { type Branch } from "@tbms/shared-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Typography } from "@/components/ui/typography";

interface BranchesDirectoryTableProps {
  branches: Branch[];
  loading: boolean;
  page: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onEdit: (branch: Branch) => void;
  onDelete: (branch: Branch) => void;
  onToggleActive: (branch: Branch) => void;
}

export function BranchesDirectoryTable({
  branches,
  loading,
  page,
  total,
  pageSize,
  onPageChange,
  onEdit,
  onDelete,
  onToggleActive,
}: BranchesDirectoryTableProps) {
  const columns = useMemo<ColumnDef<Branch>[]>(
    () => [
      {
        header: "Branch ID",
        cell: (branch) => (
          <Link href={`/settings/branches/${branch.id}`}>
            <span className="cursor-pointer text-sm font-bold tracking-tight text-primary hover:underline">
              BR-{branch.code.slice(0, 3).toUpperCase()}
            </span>
          </Link>
        ),
      },
      {
        header: "Code",
        cell: (branch) => <span className="text-sm font-bold text-foreground/60">{branch.code}</span>,
      },
      {
        header: "Name",
        cell: (branch) => (
          <div className="flex flex-col">
            <span className="text-sm font-bold leading-tight text-foreground">{branch.name}</span>
            <Label variant="dashboard" className="mt-0.5">
              Physical Hub
            </Label>
          </div>
        ),
      },
      {
        header: "Address",
        cell: (branch) => (
          <Typography as="p" variant="body" className="max-w-[180px] font-medium leading-snug text-muted-foreground">
            {branch.address || "No address provided"}
          </Typography>
        ),
      },
      {
        header: "Phone",
        cell: (branch) => (
          <span className="text-sm font-bold text-muted-foreground">{branch.phone || "No phone provided"}</span>
        ),
      },
      {
        header: "Status",
        cell: (branch) => (
          <Badge variant={branch.isActive ? "success" : "outline"} size="xs">
            {branch.isActive ? "Active" : "Inactive"}
          </Badge>
        ),
      },
      {
        header: "Actions",
        align: "right",
        cell: (branch) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 rounded-lg">
              <DropdownMenuItem asChild>
                <Link
                  href={`/settings/branches/${branch.id}`}
                  className="flex cursor-pointer items-center p-3 text-xs font-bold"
                >
                  <LayoutDashboard className="mr-2 h-4 w-4 text-primary" />
                  Manage Hub
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onEdit(branch)}
                className="cursor-pointer p-3 text-xs font-bold"
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit Branch
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onToggleActive(branch)}
                className="cursor-pointer p-3 text-xs font-bold text-foreground"
              >
                {branch.isActive ? (
                  <>
                    <Ban className="mr-2 h-4 w-4 text-warning" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4 text-success" />
                    Activate
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(branch)}
                className="cursor-pointer p-3 text-xs font-bold text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Branch
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [onDelete, onEdit, onToggleActive],
  );

  return (
    <DataTable
      columns={columns}
      data={branches}
      loading={loading}
      emptyMessage="No branches yet. Create your first branch to get started."
      itemLabel="branches"
      page={page}
      total={total}
      limit={pageSize}
      onPageChange={onPageChange}
    />
  );
}
