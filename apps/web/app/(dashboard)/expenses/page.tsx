"use client";

import React, { useState, useEffect, useCallback } from "react";
import { expensesApi, Expense, ExpenseCategory } from "@/lib/api/expenses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Calendar, Tag } from "lucide-react";
import { formatPKR, formatDate } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useBranchStore } from "@/store/useBranchStore";
import { Role } from "@tbms/shared-types";
import { DataTable, ColumnDef } from "@/components/ui/data-table";

const PAGE_SIZE = 10;

interface ExpensesFilterParams {
  page: number;
  limit: number;
  categoryId?: string;
  from?: string;
  to?: string;
}

export default function ExpensesPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const { data: session } = useSession();
  const user = session?.user;
  const { activeBranchId } = useBranchStore();
  const [form, setForm] = useState({
    categoryId: "",
    amount: "",
    expenseDate: new Date().toISOString().split("T")[0],
    description: "",
    branchId: "",
  });
  const [saving, setSaving] = useState(false);
  const [filters, setFilters] = useState({
    categoryId: "all",
    from: "",
    to: "",
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: ExpensesFilterParams = {
        page,
        limit: PAGE_SIZE,
      };
      if (filters.categoryId !== "all") params.categoryId = filters.categoryId;
      if (filters.from) params.from = filters.from;
      if (filters.to) params.to = filters.to;

      const [res, catRes] = await Promise.all([
        expensesApi.getExpenses(params),
        expensesApi.getCategories(),
      ]);
      if (res.success) {
        setExpenses(res.data.data);
        setTotal(res.data.total);
      }
      if (catRes.success) {
        setCategories(catRes.data);
      }
    } catch {
      toast({ title: "Error", description: "Failed to load expenses", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [filters, page, toast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCreate = async () => {
    const paisas = Math.round(parseFloat(form.amount) * 100);
    if (!form.categoryId || !paisas || !form.expenseDate) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const payload: Parameters<typeof expensesApi.createExpense>[0] = {
        ...form,
        amount: paisas,
        expenseDate: new Date(form.expenseDate).toISOString(),
      };
      if (user?.role === Role.SUPER_ADMIN && activeBranchId) {
        payload.branchId = activeBranchId;
      }
      
      await expensesApi.createExpense(payload);
      toast({ title: "Expense added successfully" });
      setAddOpen(false);
      setForm({
        categoryId: "",
        amount: "",
        expenseDate: new Date().toISOString().split("T")[0],
        description: "",
        branchId: "",
      });
      fetchData();
    } catch {
      toast({ title: "Error", description: "Failed to add expense", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this expense?")) return;
    try {
      await expensesApi.deleteExpense(id);
      toast({ title: "Expense deleted" });
      fetchData();
    } catch {
      toast({ title: "Error", description: "Failed to delete expense", variant: "destructive" });
    }
  };

  const columns: ColumnDef<Expense>[] = [
    {
      header: "Date",
      cell: (e) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-medium">{formatDate(e.expenseDate)}</span>
        </div>
      )
    },
    {
      header: "Category",
      cell: (e) => (
        <div className="flex items-center gap-2">
          <Tag className="h-3.5 w-3.5 text-muted-foreground" />
          <Badge variant="outline" className="font-bold text-[10px] uppercase tracking-wider bg-muted/30">
            {e.category.name}
          </Badge>
        </div>
      )
    },
    {
      header: "Description",
      cell: (e) => (
        <span className="text-xs text-muted-foreground max-w-[300px] block truncate">
          {e.description || "—"}
        </span>
      )
    },
    {
      header: "Amount",
      align: "right",
      cell: (e) => (
        <span className="font-bold text-destructive">
          {formatPKR(e.amount)}
        </span>
      )
    },
    {
      header: "Actions",
      align: "right",
      cell: (e) => (
        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/10 group" onClick={() => handleDelete(e.id)}>
          <Trash2 className="h-4 w-4 text-muted-foreground group-hover:text-destructive transition-colors" />
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6 max-w-9xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Business Expenses</h1>
          <p className="text-muted-foreground">Track and manage business overheads and supplies.</p>
        </div>
        <Button variant="premium" size="lg" onClick={() => setAddOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Expense
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="md:col-span-1 border-border/50 shadow-sm overflow-hidden">
          <CardHeader className="pb-2 bg-muted/5 border-b border-border/50">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Total Listed</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex flex-col">
              <span className="text-3xl font-bold text-destructive tracking-tight">
                {formatPKR(expenses.reduce((sum, e) => sum + e.amount, 0))}
              </span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase mt-1">on this page</span>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-3 border-border/50 shadow-sm overflow-hidden">
          <CardHeader className="pb-2 bg-muted/5 border-b border-border/50">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Quick Filters</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 flex flex-wrap gap-5">
            <div className="flex flex-col gap-2 min-w-[180px]">
              <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Category</Label>
              <Select value={filters.categoryId} onValueChange={(v) => {
                setFilters({ ...filters, categoryId: v });
                setPage(1);
              }}>
                <SelectTrigger variant="premium" className="h-10">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-col gap-2">
              <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Date Range (From)</Label>
              <Input 
                variant="premium" 
                type="date" 
                className="h-10" 
                value={filters.from} 
                onChange={(e) => {
                  setFilters({ ...filters, from: e.target.value });
                  setPage(1);
                }} 
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Date Range (To)</Label>
              <Input 
                variant="premium" 
                type="date" 
                className="h-10" 
                value={filters.to} 
                onChange={(e) => {
                  setFilters({ ...filters, to: e.target.value });
                  setPage(1);
                }} 
              />
            </div>

            <div className="flex flex-col justify-end">
               <Button 
                variant="ghost" 
                size="sm" 
                className="h-10 text-xs font-bold text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setFilters({ categoryId: "all", from: "", to: "" });
                  setPage(1);
                }}
               >
                 Reset Filters
               </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <DataTable
          columns={columns}
          data={expenses}
          loading={loading}
          page={page}
          total={total}
          limit={PAGE_SIZE}
          onPageChange={setPage}
          itemLabel="expenses"
          emptyMessage="No expenses found matching your criteria."
        />
      </div>

      {/* Add Expense Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Business Expense</DialogTitle>
            <DialogDescription>Record a new expense for the current branch.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider">Category <span className="text-destructive">*</span></Label>
              <Select value={form.categoryId} onValueChange={(v) => setForm({ ...form, categoryId: v })}>
                <SelectTrigger variant="premium" className="h-11">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider">Amount (Rs.) <span className="text-destructive">*</span></Label>
              <Input variant="premium" type="number" placeholder="e.g. 500" className="h-11" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider">Expense Date <span className="text-destructive">*</span></Label>
              <Input variant="premium" type="date" className="h-11" value={form.expenseDate} onChange={(e) => setForm({ ...form, expenseDate: e.target.value })} />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider">Description</Label>
              <Input variant="premium" placeholder="What was this for?" className="h-11" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
          </div>
          <DialogFooter className="border-t pt-4">
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button variant="premium" size="lg" onClick={handleCreate} disabled={saving || !form.categoryId || !form.amount}>
              {saving ? "Saving…" : "Save Expense"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
