"use client";

import React, { useEffect, useState, useCallback } from "react";
import { usersApi, UserAccount } from "@/lib/api/users";
import { branchesApi, Branch } from "@/lib/api/branches";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Users, Pencil, ShieldAlert, Monitor, UserCheck, Trash2, Filter } from "lucide-react";
import { DataTable, ColumnDef } from "@/components/ui/data-table";
import { ROLES, ROLE_BADGE } from "@tbms/shared-constants";
import { Role } from "@tbms/shared-types";

import { useToast } from "@/hooks/use-toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const EMPTY_FORM = { name: "", email: "", password: "", role: Role.ENTRY_OPERATOR, branchId: "ALL_BRANCHES" };

export function UsersTable() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, privileged: 0 });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [saving, setSaving] = useState(false);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserAccount | null>(null);

  const fetchStats = async () => {
    try {
      const res = await usersApi.getStats();
      if (res.success) setStats(res.data);
    } catch (err) {
      console.error("Failed to fetch user stats:", err);
    }
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [usersRes, branchesRes] = await Promise.all([usersApi.getUsers(), branchesApi.getBranches()]);
      setUsers(usersRes.data);
      setBranches(branchesRes.data);
      fetchStats();
    } catch {
      toast({ title: "Error", description: "Failed to load users", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password || undefined,
        role: form.role,
        branchId: form.branchId === "ALL_BRANCHES" ? undefined : form.branchId,
      };

      if (editingUser) {
        await usersApi.updateUser(editingUser.id, payload);
        toast({ title: "User updated successfully" });
      } else {
        await usersApi.createUser(payload);
        toast({ title: "User created successfully" });
      }
      setDialogOpen(false);
      setEditingUser(null);
      setForm(EMPTY_FORM);
      fetchData();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast({ title: "Error", description: e?.response?.data?.message ?? "Failed to create user", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (user: UserAccount) => {
    setUserToDelete(user);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    try {
        await usersApi.removeUser(userToDelete.id);
        toast({ title: "Success", description: "User account deleted" });
        fetchData();
    } catch {
        toast({ title: "Error", description: "Failed to delete user", variant: "destructive" });
    }
  };

  const handleToggleActive = async (user: UserAccount) => {
    try {
      await usersApi.setActive(user.id, !user.isActive);
      fetchData();
    } catch {
      toast({ title: "Error", description: "Failed to update user status", variant: "destructive" });
    }
  };

  const columns: ColumnDef<UserAccount>[] = [
    {
      header: "Staff Member",
      cell: (u) => (
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-muted border border-border flex items-center justify-center shrink-0">
            <Users className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-foreground leading-tight">{u.name}</span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">ID: STAFF-{u.id ? u.id.slice(0,3).toUpperCase() : '001'}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Email",
      cell: (u) => <span className="text-sm font-bold text-foreground opacity-60">{u.email}</span>,
    },
    {
      header: "Role",
      cell: (u) => (
        <Badge variant={ROLE_BADGE[u.role as Role] ?? "outline"} className="text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider">
          {u.role.replace("_", " ")}
        </Badge>
      ),
    },
    {
      header: "Branch Access",
      cell: (u) => (
        <div className="flex flex-col">
          <span className="text-sm text-foreground font-bold">{u.branch ? u.branch.name : "All Branches"}</span>
          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{u.branch ? u.branch.code : "Master Access"}</span>
        </div>
      ),
    },
    {
      header: "Last Activity",
      cell: (u) => (
        <div className="flex flex-col">
          <span className="text-sm text-foreground font-bold">{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString("en-PK") : "Never"}</span>
          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">System Log</span>
        </div>
      ),
    },
    {
      header: "Access",
      cell: (u) => <Switch variant="premium" checked={u.isActive} onCheckedChange={() => handleToggleActive(u)} />,
    },
    {
      header: "Actions",
      align: "right",
      cell: (u) => (
        <div className="flex items-center justify-end gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
            onClick={() => {
              setEditingUser(u);
              setForm({
                name: u.name,
                email: u.email,
                password: "",
                role: u.role as Role,
                branchId: u.branchId || "ALL_BRANCHES",
              });
              setDialogOpen(true);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(u)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Stats Cards */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">User Management</h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">Manage staff access levels, branch assignments, and account security.</p>
          </div>
          <Button 
            variant="premium"
            className="w-full sm:w-auto font-bold h-11 px-6 rounded-lg" 
            onClick={() => {
              setEditingUser(null);
              setForm(EMPTY_FORM);
              setDialogOpen(true);
            }}
          >
            <Plus className="mr-2 h-5 w-5" /> Add Staff Member
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="bg-card border border-border rounded-lg p-5 md:p-6 shadow-sm flex items-center gap-4 md:gap-5">
            <div className="h-12 w-12 md:h-14 md:w-14 rounded-lg bg-muted flex items-center justify-center shrink-0">
               <UserCheck className="h-6 w-6 md:h-7 md:w-7 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Active Accounts</p>
              <div className="flex items-end gap-3">
                <h3 className="text-2xl md:text-3xl font-bold text-foreground leading-none">{stats.active}</h3>
                <span className="text-[10px] font-bold text-success bg-success/10 px-2 py-0.5 rounded-lg">Secure</span>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-5 md:p-6 shadow-sm flex items-center gap-4 md:gap-5">
            <div className="h-12 w-12 md:h-14 md:w-14 rounded-lg bg-muted flex items-center justify-center shrink-0">
               <ShieldAlert className="h-6 w-6 md:h-7 md:w-7 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Privileged Roles</p>
              <div className="flex flex-col">
                <h3 className="text-2xl md:text-3xl font-bold text-foreground leading-none">{stats.privileged} Users</h3>
                <span className="text-[10px] font-bold text-muted-foreground mt-1.5 uppercase tracking-wide">Admins & Operators</span>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-5 md:p-6 shadow-sm flex items-center gap-4 md:gap-5">
            <div className="h-12 w-12 md:h-14 md:w-14 rounded-lg bg-muted flex items-center justify-center shrink-0">
               <Monitor className="h-6 w-6 md:h-7 md:w-7 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">System Health</p>
              <div className="flex flex-col">
                <h3 className="text-2xl md:text-3xl font-bold text-foreground leading-none">100%</h3>
                <span className="text-[10px] font-bold text-primary mt-1.5 uppercase tracking-wide">Live Access Control</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Users DataTable */}
      <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden text-sm">
        <div className="px-6 py-6 border-b border-border/50 flex items-center justify-between">
          <h2 className="font-bold text-lg text-foreground">Staff Access Directory</h2>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

<div className="p-6">
        <DataTable
          columns={columns}
          data={users}
          loading={loading}
          emptyMessage="No staff accounts found. Create your first user to manage access."
          itemLabel="accounts"
          />
          </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingUser ? "Edit User Account" : "Create User Account"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Full Name <span className="text-destructive">*</span></Label>
              <Input variant="premium" placeholder="Staff member name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Email <span className="text-destructive">*</span></Label>
              <Input variant="premium" type="email" placeholder="user@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Password {editingUser ? "(leave blank to keep current)" : <span className="text-destructive">*</span>}</Label>
              <Input variant="premium" type="password" placeholder={editingUser ? "Enter new password" : "Minimum 8 characters"} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Role <span className="text-destructive">*</span></Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as Role })}>
                <SelectTrigger variant="premium"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Branch</Label>
              <Select 
                value={form.branchId} 
                onValueChange={(v) => setForm({ ...form, branchId: v })}
              >
                <SelectTrigger variant="premium">
                  <SelectValue placeholder="Select branch (leave blank for all)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL_BRANCHES">All Branches</SelectItem>
                  {branches?.filter(b => b.id).map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name} ({b.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !form.name || !form.email || (!editingUser && !form.password)}>
              {saving ? (editingUser ? "Updating..." : "Creating...") : (editingUser ? "Save Changes" : "Create Account")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title="Delete User Account"
        description={`Are you sure you want to delete ${userToDelete?.name}'s account? This will permanently revoke their access to the system.`}
        onConfirm={confirmDelete}
        confirmText="Delete Account"
      />
    </div>
  );
}
