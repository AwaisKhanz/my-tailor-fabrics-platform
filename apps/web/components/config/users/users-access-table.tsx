import { Pencil, Trash2, Users } from "lucide-react";
import { ROLE_BADGE, ROLE_LABELS } from "@tbms/shared-constants";
import { type UserAccount } from "@tbms/shared-types";
import { Badge } from "@tbms/ui/components/badge";
import { Button } from "@tbms/ui/components/button";
import { DataTable, type ColumnDef } from "@tbms/ui/components/data-table";
import { Switch } from "@tbms/ui/components/switch";
import {
  USERS_ALL_BRANCHES_LABEL,
  USERS_MASTER_ACCESS_LABEL,
} from "@/hooks/use-user-account-manager";

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
  const columns: ColumnDef<UserAccount>[] = [
    {
      header: "Staff Member",
      cell: (user) => (
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted">
            <Users className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold leading-tight text-foreground">
              {user.name}
            </span>
            <span className="mt-0.5 text-xs text-muted-foreground">
              ID: STAFF-{user.id ? user.id.slice(0, 3).toUpperCase() : "001"}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Email",
      cell: (user) => (
        <span className="text-sm font-bold text-muted-foreground">
          {user.email}
        </span>
      ),
    },
    {
      header: "Role",
      cell: (user) => (
        <Badge variant={ROLE_BADGE[user.role] ?? "outline"}>
          {ROLE_LABELS[user.role]}
        </Badge>
      ),
    },
    {
      header: "Branch Access",
      cell: (user) => (
        <div className="flex flex-col">
          <span className="text-sm font-bold text-foreground">
            {user.branch ? user.branch.name : USERS_ALL_BRANCHES_LABEL}
          </span>
          <span className="text-xs text-muted-foreground">
            {user.branch ? user.branch.code : USERS_MASTER_ACCESS_LABEL}
          </span>
        </div>
      ),
    },
    {
      header: "Last Activity",
      cell: (user) => (
        <div className="flex flex-col">
          <span className="text-sm font-bold text-foreground">
            {user.lastLoginAt
              ? new Date(user.lastLoginAt).toLocaleDateString("en-PK")
              : "Never"}
          </span>
          <span className="text-xs text-muted-foreground">System Log</span>
        </div>
      ),
    },
    {
      header: "Access",
      cell: (user) => (
        <Switch
          checked={user.isActive}
          onCheckedChange={(nextChecked) => onToggleActive(user, nextChecked)}
        />
      ),
    },
    {
      header: "Actions",
      align: "right",
      cell: (user) => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => onEdit(user)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => onDelete(user)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={users}
      loading={loading}
      page={page}
      total={total}
      limit={pageSize}
      onPageChange={onPageChange}
      itemLabel="accounts"
      emptyMessage="No staff accounts found. Create your first user to manage access."
      chrome="flat"
    />
  );
}
