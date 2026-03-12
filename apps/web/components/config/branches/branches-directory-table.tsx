import { useCallback, useMemo } from "react";
import {
  type ColumnDef,
  type OnChangeFn,
  type PaginationState,
  type SortingState,
} from "@tanstack/react-table";
import Link from "next/link";
import {
  Ban,
  CheckCircle,
  LayoutDashboard,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import { type Branch } from "@tbms/shared-types";
import { Badge } from "@tbms/ui/components/badge";
import { Button } from "@tbms/ui/components/button";
import { DataTableTanstack } from "@tbms/ui/components/data-table-tanstack";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@tbms/ui/components/dropdown-menu";
import { FieldLabel } from "@tbms/ui/components/field";
import { Text } from "@tbms/ui/components/typography";
import { buildBranchHubRoute } from "@/lib/settings-routes";
import { resolveUpdater } from "@/lib/tanstack";

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
        accessorKey: "name",
        header: "Branch",
        cell: ({ row }) => (
          <Link
            href={buildBranchHubRoute(row.original.id)}
            className="group inline-flex max-w-[220px] flex-col"
          >
            <span className="truncate text-sm font-bold leading-tight text-foreground transition-colors group-hover:text-primary">
              {row.original.name}
            </span>
            <FieldLabel className="mt-0.5">
              {row.original.code.toUpperCase()}
            </FieldLabel>
          </Link>
        ),
      },
      {
        accessorKey: "phone",
        header: "Contact",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground">
              {row.original.phone || "No phone provided"}
            </span>
            <FieldLabel className="mt-0.5">Branch Hotline</FieldLabel>
          </div>
        ),
      },
      {
        accessorKey: "address",
        header: "Address",
        cell: ({ row }) => (
          <Text
            as="p"
            variant="body"
            className="max-w-[260px] font-medium leading-snug text-muted-foreground"
          >
            {row.original.address || "No address provided"}
          </Text>
        ),
      },
      {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant={row.original.isActive ? "default" : "outline"}>
            {row.original.isActive ? "Active" : "Inactive"}
          </Badge>
        ),
      },
      {
        id: "actions",
        enableSorting: false,
        header: "Actions",
        cell: ({ row }) => (
          <div
            className="flex justify-end"
            onClick={(event) => event.stopPropagation()}
          >
            {canManageBranches ? (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Open actions for ${row.original.name}`}
                    />
                  }
                >
                  <MoreVertical className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44 rounded-lg">
                  <DropdownMenuItem
                    render={<Link href={buildBranchHubRoute(row.original.id)} />}
                    className="cursor-pointer p-3 text-xs font-bold"
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4 text-primary" />
                    Manage Hub
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onEdit(row.original)}
                    className="cursor-pointer p-3 text-xs font-bold"
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit Branch
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onToggleActive(row.original)}
                    className="cursor-pointer p-3 text-xs font-bold text-foreground"
                  >
                    {row.original.isActive ? (
                      <>
                        <Ban className="mr-2 h-4 w-4 text-secondary-foreground" />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                        Activate
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDelete(row.original)}
                    className="cursor-pointer p-3 text-xs font-bold text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Branch
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                aria-label={`View ${row.original.name}`}
                onClick={() => onOpenBranch(row.original)}
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

  const pagination = useMemo<PaginationState>(
    () => ({
      pageIndex: Math.max(page - 1, 0),
      pageSize,
    }),
    [page, pageSize],
  );

  const handlePaginationChange = useCallback<OnChangeFn<PaginationState>>(
    (updater) => {
      const next =
        resolveUpdater(updater, pagination);
      onPageChange(next.pageIndex + 1);
    },
    [onPageChange, pagination],
  );

  const sorting = useMemo<SortingState>(() => [], []);
  const handleSortingChange = useCallback<OnChangeFn<SortingState>>(() => {
    return;
  }, []);
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  return (
    <DataTableTanstack
      columns={columns}
      data={branches}
      loading={loading}
      emptyMessage="No branches yet. Create your first branch to get started."
      itemLabel="branches"
      chrome="flat"
      pagination={pagination}
      onPaginationChange={handlePaginationChange}
      pageCount={pageCount}
      totalCount={total}
      manualPagination
      sorting={sorting}
      onSortingChange={handleSortingChange}
      onRowClick={(row) => onOpenBranch(row.original)}
    />
  );
}
