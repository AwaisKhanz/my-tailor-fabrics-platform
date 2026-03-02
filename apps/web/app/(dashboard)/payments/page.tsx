"use client";

import React, { useState, useEffect, useCallback } from "react";
import { paymentsApi, PaymentSummary } from "@/lib/api/payments";
import { employeesApi } from "@/lib/api/employees";
import { Employee } from "@/types/employees";
import { Payment } from "@tbms/shared-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Banknote, Plus, Calendar } from "lucide-react";
import { formatPKR, formatDate } from "@/lib/utils";
import { DataTable, ColumnDef } from "@/components/ui/data-table";

const PAGE_SIZE = 10;

export default function PaymentsPage() {
  const { toast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmpId, setSelectedEmpId] = useState<string>("");
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  
  const [history, setHistory] = useState<Payment[]>([]);
  const [totalHistory, setTotalHistory] = useState(0);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [disburseOpen, setDisburseOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [disbursing, setDisbursing] = useState(false);

  useEffect(() => {
    employeesApi.getEmployees({ page: 1, limit: 100 }).then((res) => {
      if (res.success) setEmployees(res.data.data);
    }).catch(() => {});
  }, []);

  const loadSummary = useCallback(async (empId: string) => {
    if (!empId) return;
    setSummaryLoading(true);
    try {
      const res = await paymentsApi.getEmployeeSummary(empId);
      setSummary(res.data);
    } catch {
      toast({ title: "Error", description: "Could not load payment summary", variant: "destructive" });
    } finally {
      setSummaryLoading(false);
    }
  }, [toast]);

  const loadHistory = useCallback(async () => {
    if (!selectedEmpId) return;
    setHistoryLoading(true);
    try {
      const res = await paymentsApi.getPaymentHistory(selectedEmpId, {
        page: historyPage,
        limit: PAGE_SIZE
      });
      if (res.success) {
        setHistory(res.data.data);
        setTotalHistory(res.data.total);
      }
    } catch {
      toast({ title: "Error", description: "Could not load payment history", variant: "destructive" });
    } finally {
      setHistoryLoading(false);
    }
  }, [selectedEmpId, historyPage, toast]);

  useEffect(() => {
    if (selectedEmpId) {
      loadSummary(selectedEmpId);
      loadHistory();
    }
  }, [selectedEmpId, historyPage, loadSummary, loadHistory]);

  const handleEmployeeChange = (id: string) => {
    setSelectedEmpId(id);
    setHistoryPage(1);
    setSummary(null);
    setHistory([]);
  };

  const handleDisburse = async () => {
    const paisas = Math.round(parseFloat(amount) * 100);
    if (!paisas || paisas <= 0) {
      toast({ title: "Invalid amount", variant: "destructive" });
      return;
    }
    setDisbursing(true);
    try {
      await paymentsApi.disburse({ employeeId: selectedEmpId, amount: paisas, note: note || undefined });
      toast({ title: "Payment disbursed successfully" });
      setDisburseOpen(false);
      setAmount("");
      setNote("");
      loadSummary(selectedEmpId);
      setHistoryPage(1);
      loadHistory();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast({
        title: "Error",
        description: e?.response?.data?.message ?? "Failed to disburse payment",
        variant: "destructive",
      });
    } finally {
      setDisbursing(false);
    }
  };

  const currentBalance = summary ? summary.currentBalance : 0;
  const selectedEmployee = employees.find((e) => e.id === selectedEmpId);

  const columns: ColumnDef<Payment>[] = [
    {
      header: "Paid Date",
      cell: (p) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-medium">{formatDate(p.paidAt)}</span>
        </div>
      )
    },
    {
      header: "Note",
      cell: (p) => (
        <span className="text-xs text-muted-foreground italic">
          {p.note || "—"}
        </span>
      )
    },
    {
      header: "Amount",
      align: "right",
      cell: (p) => (
        <span className="font-bold text-primary">
          {formatPKR(p.amount)}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6 max-w-9xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Employee Payments</h1>
          <p className="text-muted-foreground">Disburse pay and view payment history.</p>
        </div>
      </div>

      <Card className="border-border/50 shadow-sm overflow-hidden">
        <CardHeader className="pb-4 bg-muted/5 border-b border-border/50">
          <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Active Selection</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="max-w-md space-y-2">
            <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Select Tailor / Staff</Label>
            <Select value={selectedEmpId} onValueChange={handleEmployeeChange}>
              <SelectTrigger variant="premium" className="h-11">
                <SelectValue placeholder="Choose an employee…" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.fullName} <span className="text-muted-foreground opacity-60 ml-1">({e.employeeCode})</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {selectedEmpId && (
        <>
          {summaryLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
            </div>
          ) : summary ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <Card className="border-border/50 shadow-sm overflow-hidden border-l-4 border-l-success">
                  <CardHeader className="flex flex-row items-center justify-between pb-2 bg-muted/5">
                    <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Total Earned</CardTitle>
                    <Banknote className="h-4 w-4 text-success" />
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p className="text-3xl font-bold text-success tracking-tight">{formatPKR(summary.totalEarned)}</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">All lifecycle steps</p>
                  </CardContent>
                </Card>

                <Card className="border-border/50 shadow-sm overflow-hidden border-l-4 border-l-primary">
                  <CardHeader className="flex flex-row items-center justify-between pb-2 bg-muted/5">
                    <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Total Paid</CardTitle>
                    <Banknote className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p className="text-3xl font-bold text-primary tracking-tight">{formatPKR(summary.totalPaid)}</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">Settled disbursements</p>
                  </CardContent>
                </Card>

                <Card className={`border-border/50 shadow-sm overflow-hidden border-l-4 ${currentBalance > 0 ? "border-l-warning bg-warning/5" : "border-l-muted"}`}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2 bg-muted/5">
                    <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Outstanding Balance</CardTitle>
                    <Banknote className="h-4 w-4 text-warning" />
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <p className={`text-3xl font-bold tracking-tight ${currentBalance > 0 ? "text-warning" : "text-muted-foreground opacity-40"}`}>
                        {formatPKR(currentBalance)}
                      </p>
                      {currentBalance > 0 && (
                        <Button variant="premium" size="sm" className="h-8 font-bold text-[10px] uppercase tracking-wider" onClick={() => setDisburseOpen(true)}>
                          <Plus className="h-3 w-3 mr-1" /> Disburse
                        </Button>
                      )}
                    </div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">Payable amount</p>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                   <h2 className="text-lg font-bold tracking-tight">Payment History</h2>
                   <Badge variant="secondary" className="font-bold text-[10px] tracking-widest uppercase">{totalHistory} records</Badge>
                </div>
                <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                  <DataTable
                    columns={columns}
                    data={history}
                    loading={historyLoading}
                    page={historyPage}
                    total={totalHistory}
                    limit={PAGE_SIZE}
                    onPageChange={setHistoryPage}
                    itemLabel="payments"
                    emptyMessage="No payment records found for this employee."
                  />
                </div>
              </div>
            </>
          ) : null}
        </>
      )}

      {!selectedEmpId && (
        <EmptyState 
          icon={Banknote} 
          title="No Employee Selected" 
          description="Please choose an employee from the dropdown above to view their financial ledger and payout history." 
        />
      )}

      {/* Disburse Dialog */}
      <Dialog open={disburseOpen} onOpenChange={setDisburseOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Disburse Payment</DialogTitle>
            <DialogDescription>Initiating payout for <strong>{selectedEmployee?.fullName}</strong>.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-muted/30 border border-border/50 rounded-xl">
              <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest block mb-1">Available to pay</span>
              <span className="text-2xl font-bold text-warning tracking-tight">{formatPKR(currentBalance)}</span>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider">Amount (Rs.) <span className="text-destructive">*</span></Label>
              <Input
                variant="premium"
                type="number"
                placeholder="e.g. 5000"
                className="h-11 font-bold text-lg"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider">Note / Remarks</Label>
              <Input variant="premium" className="h-11" placeholder="e.g. Weekly settlement, Advance payment..." value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
          </div>
          <DialogFooter className="border-t pt-4">
            <Button variant="outline" onClick={() => setDisburseOpen(false)}>Cancel</Button>
            <Button variant="premium" size="lg" onClick={handleDisburse} disabled={disbursing || !amount}>
              {disbursing ? "Processing…" : "Confirm & Pay"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
