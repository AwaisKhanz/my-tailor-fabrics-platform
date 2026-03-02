"use client";

import React, { useState, useEffect, useCallback } from "react";
import { paymentsApi, PaymentSummary } from "@/lib/api/payments";
import { employeesApi } from "@/lib/api/employees";
import type { Employee } from "@/types/employees";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/hooks/use-toast";
import { Wallet, TrendingUp, DollarSign, Plus } from "lucide-react";
import { formatPKR } from "@/lib/utils";

export default function PaymentsPage() {
  const { toast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmpId, setSelectedEmpId] = useState<string>("");
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
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

  const handleEmployeeChange = (id: string) => {
    setSelectedEmpId(id);
    setSummary(null);
    loadSummary(id);
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

  return (
    <div className="max-w-9xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Employee Payments</h1>
          <p className="text-muted-foreground">Disburse pay and view payment history.</p>
        </div>
      </div>

      {/* Employee Selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="max-w-sm space-y-1.5">
            <Label>Select Employee</Label>
            <Select value={selectedEmpId} onValueChange={handleEmployeeChange}>
              <SelectTrigger variant="premium">
                <SelectValue placeholder="Choose an employee…" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.fullName} — {e.employeeCode}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Balance Summary */}
      {selectedEmpId && (
        <>
          {summaryLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
            </div>
          ) : summary ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card variant="premium">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Earned</CardTitle>
                    <TrendingUp className="h-4 w-4 text-success" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-success">{formatPKR(summary.totalEarned)}</p>
                    <p className="text-xs text-muted-foreground mt-1">All completed pieces</p>
                  </CardContent>
                </Card>
                <Card variant="premium">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Paid</CardTitle>
                    <DollarSign className="h-4 w-4 text-primary font-bold" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-primary">{formatPKR(summary.totalPaid)}</p>
                    <p className="text-xs text-muted-foreground mt-1">All disbursements</p>
                  </CardContent>
                </Card>
                <Card variant="premium" className={currentBalance > 0 ? "border-warning/30 bg-warning/5" : ""}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Current Balance</CardTitle>
                    <Wallet className="h-4 w-4 text-warning" />
                  </CardHeader>
                  <CardContent>
                    <p className={`text-2xl font-bold ${currentBalance > 0 ? "text-warning" : "text-muted-foreground"}`}>
                      {formatPKR(currentBalance)}
                    </p>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-xs text-muted-foreground">Pending payout</p>
                      {currentBalance > 0 && (
                        <Button variant="premium" size="sm" className="h-7 text-xs" onClick={() => setDisburseOpen(true)}>
                          <Plus className="h-3 w-3 mr-1" /> Disburse
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Weekly breakdown */}
              {summary.weekly && summary.weekly.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Weekly Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Week</TableHead>
                          <TableHead className="text-right">Earned</TableHead>
                          <TableHead className="text-right">Paid</TableHead>
                          <TableHead className="text-right">Balance</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {summary.weekly.map((w, i) => (
                          <TableRow key={i}>
                            <TableCell className="text-sm">
                              {new Date(w.week_start).toLocaleDateString("en-PK")} — {new Date(w.week_end).toLocaleDateString("en-PK")}
                            </TableCell>
                            <TableCell className="text-right text-success font-medium">{formatPKR(Number(w.earned))}</TableCell>
                            <TableCell className="text-right text-primary font-medium">{formatPKR(Number(w.paid))}</TableCell>
                            <TableCell className="text-right font-bold">{formatPKR(Number(w.closing_balance))}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </>
          ) : null}
        </>
      )}

      {!selectedEmpId && (
        <EmptyState icon={Wallet} title="Select an employee" description="Choose an employee above to view their payment balance and history." />
      )}

      {/* Disburse Dialog */}
      <Dialog open={disburseOpen} onOpenChange={setDisburseOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Disburse Payment — {selectedEmployee?.fullName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="p-3 bg-muted/50 rounded-lg text-sm">
              Available balance: <span className="font-bold text-warning">{formatPKR(currentBalance)}</span>
            </div>
            <div className="space-y-1.5">
              <Label>Amount (Rs.) <span className="text-destructive">*</span></Label>
              <Input
                variant="premium"
                type="number"
                placeholder="e.g. 5000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Note</Label>
              <Input variant="premium" placeholder="e.g. Weekly salary, advance, etc." value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDisburseOpen(false)}>Cancel</Button>
            <Button variant="premium" onClick={handleDisburse} disabled={disbursing || !amount}>
              {disbursing ? "Processing…" : "Confirm Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
