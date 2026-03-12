import { useCallback, useMemo } from "react";
import {
  type ColumnDef,
  type OnChangeFn,
  type PaginationState,
  type SortingState,
} from "@tanstack/react-table";
import { Pencil, Trash2, Users } from "lucide-react";
import { ROLE_BADGE, ROLE_LABELS } from "@tbms/shared-constants";
import { type UserAccount } from "@tbms/shared-types";
import { Badge } from "@tbms/ui/components/badge";
import { Button } from "@tbms/ui/components/button";
import { DataTableTanstack } from "@tbms/ui/components/data-table-tanstack";
import { Switch } from "@tbms/ui/components/switch";
import {
  USERS_ALL_BRANCHES_LABEL,
  USERS_MASTER_ACCESS_LABEL,
} from "@/hooks/use-user-account-manager";
import { resolveUpdater } from "@/lib/tanstack";

interface UsersAccessTableProps {
  users: UserAccount[];
  loading: boolean;
  page: number;
  total: number;
  pageSize: number;
  onEdit: (user: UserAccount) => void;
  onDelete: (user: UserAccount) => void;
  onPageChange: (page: number) => void;
  onToggleActive: (user: UserAccount, isActive: boolean) => void;
}

export function UsersAccessTable({
  users,
  loading,
  page,
  total,
  pageSize,
  onEdit,
  onDelete,
  onPageChange,
  onToggleActive,
}: UsersAccessTableProps) {
  const columns = useMemo<ColumnDef<UserAccount>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Staff Member",
        cell: ({ row }) => (
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted">
            <Users className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold leading-tight text-foreground">
              {row.original.name}
            </span>
            <span className="mt-0.5 text-xs text-muted-foreground">
              ID: STAFF-{row.original.id ? row.original.id.slice(0, 3).toUpperCase() : "001"}
            </span>
          </div>
        </div>
      ),
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => (
        <span className="text-sm font-bold text-muted-foreground">
          {row.original.email}
        </span>
      ),
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => (
        <Badge variant={ROLE_BADGE[row.original.role] ?? "outline"}>
          {ROLE_LABELS[row.original.role]}
        </Badge>
      ),
      },
      {
        id: "branchAccess",
        enableSorting: false,
        header: "Branch Access",
        cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-sm font-bold text-foreground">
            {row.original.branch ? row.original.branch.name : USERS_ALL_BRANCHES_LABEL}
          </span>
          <span className="text-xs text-muted-foreground">
            {row.original.branch ? row.original.branch.code : USERS_MASTER_ACCESS_LABEL}
          </span>
        </div>
      ),
      },
      {
        accessorKey: "lastLoginAt",
        header: "Last Activity",
        cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-sm font-bold text-foreground">
            {row.original.lastLoginAt
              ? new Date(row.original.lastLoginAt).toLocaleDateString("en-PK")
              : "Never"}
          </span>
          <span className="text-xs text-muted-foreground">System Log</span>
        </div>
      ),
      },
      {
        id: "access",
        enableSorting: false,
        header: "Access",
        cell: ({ row }) => (
        <Switch
          checked={row.original.isActive}
          onCheckedChange={(nextChecked) =>
            onToggleActive(row.original, nextChecked)
          }
        />
      ),
      },
      {
        id: "actions",
        enableSorting: false,
        header: "Actions",
        cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(row.original)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onDelete(row.original)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
      },
    ],
    [onDelete, onEdit, onToggleActive],
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
      data={users}
      loading={loading}
      chrome="flat"
      pagination={pagination}
      onPaginationChange={handlePaginationChange}
      pageCount={pageCount}
      totalCount={total}
      manualPagination
      sorting={sorting}
      onSortingChange={handleSortingChange}
      itemLabel="accounts"
      emptyMessage="No staff accounts found. Create your first user to manage access."
    />
  );
}
