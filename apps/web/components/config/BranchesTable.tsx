"use client";

import React, { useEffect, useState, useCallback } from "react";
import { branchesApi } from "@/lib/api/branches";
import { Branch } from "@tbms/shared-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, MoreVertical, LayoutDashboard, Search, Trash2, Ban, CheckCircle } from "lucide-react";
import Link from "next/link";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { DataTable, ColumnDef } from "@/components/ui/data-table";
import { useToast } from "@/hooks/use-toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useDebounce } from "@/hooks/use-debounce";
import { ScrollableDialog } from "@/components/ui/scrollable-dialog";

const EMPTY_FORM = { code: "", name: "", address: "", phone: "" };

export function BranchesTable() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Branch | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState<Branch | null>(null);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await branchesApi.getBranches({
        search: debouncedSearch,
        page: currentPage,
        limit: itemsPerPage
      });
      // Handle array or PaginatedResponse
      if (Array.isArray(res)) {
        setBranches(res as unknown as Branch[]);
        setTotalCount((res as unknown as Branch[]).length);
      } else {
        setBranches(res.data.data);
        setTotalCount(res.data.total);
      }
    } catch {
      toast({ title: "Error", description: "Failed to load branches", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, currentPage, toast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setDialogOpen(true); };
  const openEdit = (b: Branch) => {
    setEditing(b);
    setForm({ code: b.code, name: b.name, address: b.address ?? "", phone: b.phone ?? "" });
    setDialogOpen(true);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await branchesApi.updateBranch(editing.id, { name: form.name, address: form.address || undefined, phone: form.phone || undefined });
        toast({ title: "Branch updated" });
      } else {
        await branchesApi.createBranch({ code: form.code, name: form.name, address: form.address || undefined, phone: form.phone || undefined });
        toast({ title: "Branch created" });
      }
      setDialogOpen(false);
      fetchData();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast({ title: "Error", description: e?.response?.data?.message ?? "Failed to save", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (branch: Branch) => {
    setBranchToDelete(branch);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!branchToDelete) return;
    try {
        await branchesApi.removeBranch(branchToDelete.id);
        toast({ title: "Success", description: "Branch deleted successfully" });
        fetchData();
    } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        const message = error.response?.data?.message || "Failed to delete branch";
        toast({ title: "Error", description: message, variant: "destructive" });
    }
  };

  const handleToggleActive = async (branch: Branch) => {
    try {
      await branchesApi.updateBranch(branch.id, { isActive: !branch.isActive });
      fetchData();
    } catch {
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    }
  };

  const columns: ColumnDef<Branch>[] = [
    {
      header: "Branch ID",
      cell: (b) => (
        <Link href={`/settings/branches/${b.id}`}>
          <span className="font-bold text-primary text-sm tracking-tight cursor-pointer hover:underline">
            BR-{b.code.slice(0,3).toUpperCase()}
          </span>
        </Link>
      ),
    },
    {
      header: "Code",
      cell: (b) => <span className="text-sm font-bold text-foreground opacity-60">{b.code}</span>,
    },
    {
      header: "Name",
      cell: (b) => (
        <div className="flex flex-col">
          <span className="text-sm font-bold text-foreground leading-tight">{b.name}</span>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">Physical Hub</span>
        </div>
      ),
    },
    {
      header: "Address",
      cell: (b) => <p className="text-sm text-muted-foreground font-medium max-w-[180px] leading-snug">{b.address || "No address provided"}</p>,
    },
    {
      header: "Phone",
      cell: (b) => <span className="text-sm text-muted-foreground font-bold">{b.phone || "No phone provided"}</span>,
    },
    {
      header: "Status",
      cell: (b) => (
        <Badge variant={b.isActive ? "success" : "outline"} className="uppercase font-bold tracking-wider">
          {b.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      header: "Actions",
      align: "right",
      cell: (b) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40 rounded-lg">
            <DropdownMenuItem asChild>
                <Link href={`/settings/branches/${b.id}`} className="font-bold text-xs p-3 cursor-pointer flex items-center">
                    <LayoutDashboard className="mr-2 h-4 w-4 text-primary" /> Manage Hub
                </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openEdit(b)} className="font-bold text-xs p-3 cursor-pointer">
               <Pencil className="mr-2 h-4 w-4" /> Edit Branch
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleToggleActive(b)} className="font-bold text-xs p-3 cursor-pointer text-foreground">
               {b.isActive ? (
                 <>
                   <Ban className="mr-2 h-4 w-4 text-warning" /> Deactivate
                 </>
               ) : (
                 <>
                   <CheckCircle className="mr-2 h-4 w-4 text-success" /> Activate
                 </>
               )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDelete(b)} className="font-bold text-xs p-3 cursor-pointer text-destructive focus:text-destructive">
               <Trash2 className="mr-2 h-4 w-4" /> Delete Branch
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const footerActions = (
    <div className="flex justify-end gap-2 w-full">
      <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
      <Button type="submit" form="branch-form" variant="premium" disabled={saving || !form.name || (!editing && !form.code)}>
        {saving ? "Saving…" : editing ? "Save Changes" : "Create Branch"}
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Branch Management</h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">Configure and oversee all physical organizational locations and their status.</p>
          </div>
          <Button variant="premium" size="xl" onClick={openCreate}>
            <Plus className="mr-2 h-5 w-5" /> Add New Branch
          </Button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
             <h2 className="font-bold text-lg text-foreground">Location Directory</h2>
             <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground bg-muted px-2 py-0.5 rounded-md ring-1 ring-border">
                {totalCount} results
             </span>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="relative group flex-1 md:w-64">
                <Input 
                   placeholder="Search branches..." 
                   variant="premium"
                   className="pl-9"
                   value={search}
                   onChange={(e) => {
                      setSearch(e.target.value);
                      setCurrentPage(1);
                   }}
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
             </div>
          </div>
        </div>

        <div className="p-6">
          <DataTable
            columns={columns}
            data={branches}
            loading={loading}
            emptyMessage="No branches yet. Create your first branch to get started."
            itemLabel="branches"
            page={currentPage}
            total={totalCount}
            limit={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      <ScrollableDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen}
        title={editing ? "Edit Branch" : "Create Branch"}
        footerActions={footerActions}
      >
        <form id="branch-form" onSubmit={handleSave} className="space-y-4 py-2">
          {!editing && (
            <div className="space-y-1.5">
              <Label>Branch Code <span className="text-destructive">*</span></Label>
              <Input variant="premium" placeholder="e.g. LHR, KHI" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} maxLength={6} />
              <p className="text-xs text-muted-foreground">Short unique code used in order and customer numbers. Cannot be changed later.</p>
            </div>
          )}
          <div className="space-y-1.5">
            <Label>Branch Name <span className="text-destructive">*</span></Label>
            <Input variant="premium" placeholder="e.g. Lahore Main Branch" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Phone</Label>
            <Input variant="premium" placeholder="Contact number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Address</Label>
            <Input variant="premium" placeholder="Street address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
        </form>
      </ScrollableDialog>

      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title="Delete Branch"
        description={(
            <div className="space-y-4 pt-2">
              <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                Are you sure you want to delete <strong className="text-foreground">&quot;{branchToDelete?.name}&quot;</strong>? 
                This action will hide the branch and deactivate it. Historic data will be preserved, but new operations will be blocked.
              </p>
              
              <div className="p-3 bg-muted/50 rounded-lg border border-border space-y-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Linked Records Impact</p>
                <div className="grid grid-cols-3 gap-2">
                   <div className="flex flex-col px-2 py-1.5 bg-background rounded-md border border-border shadow-sm">
                      <span className="text-xs font-bold text-foreground">{branchToDelete?._count?.employees || 0}</span>
                      <span className="text-[9px] font-bold text-muted-foreground uppercase">Staff</span>
                   </div>
                   <div className="flex flex-col px-2 py-1.5 bg-background rounded-md border border-border shadow-sm">
                      <span className="text-xs font-bold text-foreground">{branchToDelete?._count?.customers || 0}</span>
                      <span className="text-[9px] font-bold text-muted-foreground uppercase">Clients</span>
                   </div>
                   <div className="flex flex-col px-2 py-1.5 bg-background rounded-md border border-border shadow-sm">
                      <span className="text-xs font-bold text-foreground">{branchToDelete?._count?.orders || 0}</span>
                      <span className="text-[9px] font-bold text-muted-foreground uppercase">All Orders</span>
                   </div>
                </div>
              </div>

              {(branchToDelete?._count?.orders || 0) > 0 && (
                 <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                    <p className="text-xs font-bold text-warning leading-snug">
                      <span className="mr-1">⚠️</span> 
                      Warning: This branch has active orders. The system will block deletion until they are completed or cancelled.
                    </p>
                 </div>
              )}
            </div>
        )}
        onConfirm={confirmDelete}
        confirmText="Delete Branch"
      />
    </div>
  );
}
