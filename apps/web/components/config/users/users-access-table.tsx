import { Pencil, Trash2, Users } from "lucide-react";
import { ROLE_BADGE, ROLE_LABELS } from "@tbms/shared-constants";
import { type UserAccount } from "@tbms/shared-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { InfoTile } from "@/components/ui/info-tile";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  USERS_ALL_BRANCHES_LABEL,
  USERS_MASTER_ACCESS_LABEL,
} from "@/hooks/use-users-page";

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
            <InfoTile
              padding="none"
              className="h-10 w-10 shrink-0 items-center justify-center"
            >
              <Users className="h-5 w-5 text-muted-foreground" />
            </InfoTile>
            <div className="flex flex-col">
              <span className="text-sm font-bold leading-tight text-foreground">
                {user.name}
              </span>
              <Label className="text-sm font-bold uppercase  text-muted-foreground mt-0.5">
                ID: STAFF-{user.id ? user.id.slice(0, 3).toUpperCase() : "001"}
              </Label>
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
          <Badge variant={ROLE_BADGE[user.role] ?? "outline"} size="xs">
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
            <Label className="text-sm font-bold uppercase  text-muted-foreground">
              {user.branch ? user.branch.code : USERS_MASTER_ACCESS_LABEL}
            </Label>
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
            <Label className="text-sm font-bold uppercase  text-muted-foreground">
              System Log
            </Label>
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
            <Button
              variant="outline"
              size="icon"
              onClick={() => onDelete(user)}
            >
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
