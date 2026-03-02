"use client";

import React, { useState, useEffect, useCallback } from "react";
import { expensesApi, Expense, ExpenseCategory } from "@/lib/api/expenses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, Plus, Trash2 } from "lucide-react";
import { formatPKR, formatDate } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useBranchStore } from "@/store/useBranchStore";
import { Role } from "@tbms/shared-types";

export default function ExpensesPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState<Expense[]>([]);
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
      const params: Record<string, string> = {};
      if (filters.categoryId !== "all") params.categoryId = filters.categoryId;
      if (filters.from) params.from = filters.from;
      if (filters.to) params.to = filters.to;

      const [res, catRes] = await Promise.all([
        expensesApi.getExpenses(params),
        expensesApi.getCategories(),
      ]);
      if (res.success) {
        setExpenses(res.data.data);
      }
      if (catRes.success) {
        setCategories(catRes.data);
      }
    } catch {
      toast({ title: "Error", description: "Failed to load expenses", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [filters, toast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Removed manual branch fetching logic for Super Admins; using strictly global activeBranchId

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

  const totalThisMonth = expenses.reduce((sum: number, e: Expense) => sum + e.amount, 0);

  return (
    <div className="max-w-9xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Business Expenses</h1>
          <p className="text-muted-foreground">Track and manage business overheads and supplies.</p>
        </div>
        <Button variant="premium" onClick={() => setAddOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Expense
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total (Listed)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-destructive">{formatPKR(totalThisMonth)}</p>
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Filters</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <div className="flex flex-col gap-1.5 min-w-[150px]">
              <Label className="text-[10px] uppercase font-bold text-muted-foreground">Category</Label>
              <Select value={filters.categoryId} onValueChange={(v) => setFilters({ ...filters, categoryId: v })}>
              <SelectTrigger variant="premium" className="h-9"><SelectValue placeholder="All Categories" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-[10px] uppercase font-bold text-muted-foreground">From</Label>
              <Input variant="premium" type="date" className="h-9" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-[10px] uppercase font-bold text-muted-foreground">To</Label>
              <Input variant="premium" type="date" className="h-9" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} />
            </div>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <TableSkeleton cols={5} rows={5} />
      ) : expenses.length === 0 ? (
        <EmptyState icon={DollarSign} title="No expenses found" description="Try adjusting your filters or add a new expense." />
      ) : (
        <Card variant="premium">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="text-sm">{formatDate(e.expenseDate)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{e.category.name}</Badge>
                  </TableCell>
                  <TableCell className="text-sm max-w-[300px] truncate">{e.description || "—"}</TableCell>
                  <TableCell className="text-right font-medium text-destructive">{formatPKR(e.amount)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(e.id)}>
                      <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Add Expense Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Business Expense</DialogTitle>
            <CardDescription>Record a new expense for the current branch.</CardDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Branch is now auto-assigned from globally selected activeBranchId for Super Admins */}
            <div className="space-y-1.5">
              <Label>Category <span className="text-destructive">*</span></Label>
              <Select value={form.categoryId} onValueChange={(v) => setForm({ ...form, categoryId: v })}>
              <SelectTrigger variant="premium"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Amount (Rs.) <span className="text-destructive">*</span></Label>
              <Input variant="premium" type="number" placeholder="500" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Date <span className="text-destructive">*</span></Label>
              <Input variant="premium" type="date" value={form.expenseDate} onChange={(e) => setForm({ ...form, expenseDate: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Input variant="premium" placeholder="What was this for?" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button variant="premium" onClick={handleCreate} disabled={saving || !form.categoryId || !form.amount}>
              {saving ? "Saving…" : "Save Expense"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
