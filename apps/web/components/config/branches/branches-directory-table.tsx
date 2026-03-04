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
  onOpenBranch: (branch: Branch) => void;
  onEdit: (branch: Branch) => void;
  onDelete: (branch: Branch) => void;
  onToggleActive: (branch: Branch) => void;
  canManageBranches?: boolean;
}

export function BranchesDirectoryTable({
  branches,
  loading,
  page,
  total,
  pageSize,
  onPageChange,
  onOpenBranch,
  onEdit,
  onDelete,
  onToggleActive,
  canManageBranches = true,
}: BranchesDirectoryTableProps) {
  const columns = useMemo<ColumnDef<Branch>[]>(
    () => [
      {
        header: "Branch",
        cell: (branch) => (
          <Link href={`/settings/branches/${branch.id}`} className="group inline-flex max-w-[220px] flex-col">
            <span className="truncate text-sm font-bold leading-tight text-foreground transition-colors group-hover:text-primary">
              {branch.name}
            </span>
            <Label variant="dashboard" className="mt-0.5 uppercase">
              {branch.code.toUpperCase()}
            </Label>
          </Link>
        ),
      },
      {
        header: "Contact",
        cell: (branch) => (
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground">
              {branch.phone || "No phone provided"}
            </span>
            <Label variant="dashboard" className="mt-0.5">
              Branch Hotline
            </Label>
          </div>
        ),
      },
      {
        header: "Address",
        cell: (branch) => (
          <Typography as="p" variant="body" className="max-w-[260px] font-medium leading-snug text-muted-foreground">
            {branch.address || "No address provided"}
          </Typography>
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
          <div className="flex justify-end" onClick={(event) => event.stopPropagation()}>
            {canManageBranches ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="tableIcon"
                    size="iconSm"
                    aria-label={`Open actions for ${branch.name}`}
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
            ) : (
              <Button
                variant="tableIcon"
                size="iconSm"
                aria-label={`View ${branch.name}`}
                onClick={() => onOpenBranch(branch)}
              >
                <LayoutDashboard className="h-4 w-4" />
              </Button>
            )}
          </div>
        ),
      },
    ],
    [canManageBranches, onDelete, onEdit, onOpenBranch, onToggleActive],
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
      onRowClick={onOpenBranch}
      chrome="flat"
    />
  );
}
