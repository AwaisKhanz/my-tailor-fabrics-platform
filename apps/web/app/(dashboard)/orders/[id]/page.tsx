"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { ordersApi } from "@/lib/api/orders";
import { employeesApi } from "@/lib/api/employees";
import { Order, OrderStatus, OrderItem } from "@tbms/shared-types";
import { ORDER_STATUS_CONFIG } from "@tbms/shared-constants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  Clock,
  CreditCard,
  Package,
  Printer,
  ChevronRight,
  Loader2,
  Plus,
  XCircle,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";


import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TaskAssignmentDialog } from "./TaskAssignmentDialog";

import { formatDate } from "@/lib/utils";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [processing, setProcessing] = useState(false);


  const [taskOpen, setTaskOpen] = useState(false);
  const [taskItem, setTaskItem] = useState<OrderItem | null>(null);

  const [employees, setEmployees] = useState<Array<{ id: string; fullName: string }>>([]);

  const fetchOrder = useCallback(async () => {
    setLoading(true);
    try {
      const response = await ordersApi.getOrder(params.id as string);
      if (response.success) {
        setOrder(response.data);
      }
    } catch {
      toast({ title: "Error", description: "Order not found", variant: "destructive" });
      router.push("/orders");
    } finally {
      setLoading(false);
    }
  }, [params.id, router, toast]);

  useEffect(() => {
    if (params.id) {
        fetchOrder();
        employeesApi.getEmployees({ limit: 100 }).then(res => {
          if (res.success) setEmployees(res.data.data);
        }).catch(() => {});
    }
  }, [params.id, fetchOrder]);

  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    if (!order) return;
    setStatusLoading(true);
    try {
      await ordersApi.updateStatus(order.id, { status: newStatus, note: `Moved to ${newStatus}` });
      toast({ title: "Status Updated", description: `Order is now ${newStatus}` });
      fetchOrder();
    } catch {
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    } finally {
      setStatusLoading(false);
    }
  };

  const handleAddPayment = async () => {
    if (!order || !amount) return;
    const paisas = Math.round(parseFloat(amount) * 100);
    setProcessing(true);
    try {
      await ordersApi.addPayment(order.id, { amount: paisas, note });
      toast({ title: "Payment Added" });
      setPaymentOpen(false);
      setAmount("");
      setNote("");
      fetchOrder();
    } catch (err: unknown) {
      const errorResponse = err as { response?: { data?: { message?: string } } };
      toast({ title: "Error", description: errorResponse?.response?.data?.message ?? "Failed to add payment", variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };


  if (loading) return <div className="p-6 space-y-4"><Skeleton className="h-10 w-1/4" /><Skeleton className="h-64 w-full" /></div>;
  if (!order) return null;

  const sc = ORDER_STATUS_CONFIG[order.status] ?? { label: order.status, variant: "outline" };

  const timelineSteps = [
    { key: "Order Created", done: true, active: false },
    { key: "Measurements Taken", done: true, active: false },
    { key: "In Progress", done: false, active: order.status === OrderStatus.IN_PROGRESS },
    { key: "Ready for Trial", done: order.status === OrderStatus.DELIVERED || order.status === OrderStatus.COMPLETED, active: order.status === OrderStatus.READY },
    { key: "Completed & Delivered", done: order.status === OrderStatus.COMPLETED, active: order.status === OrderStatus.DELIVERED },
  ];

  const historyForTimeline = order.statusHistory ?? [];

  return (
    <div className="space-y-5 max-w-9xl mx-auto">

      {/* Breadcrumb + Page Header */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
        <span
          className="hover:text-foreground cursor-pointer transition-colors"
          onClick={() => router.push("/orders")}
        >
          Orders
        </span>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium">{order.orderNumber}</span>
      </div>

      {/* Header Card */}
      <Card className="shadow-sm border-border">
        <CardContent className="px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">{order.orderNumber}</h1>
              <Badge variant={sc.variant} className="uppercase tracking-wider">
                {sc.label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Created on {formatDate(order.createdAt)} &bull; Due on {formatDate(order.dueDate)}
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Button 
              variant="muted" 
              size="sm" 
              className="gap-2 font-bold text-xs" 
              onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/orders/${order.id}/receipt`, '_blank')}
            >
              <Printer className="h-4 w-4" /> Print Receipt
            </Button>
            {order.status !== OrderStatus.CANCELLED && order.status !== OrderStatus.COMPLETED && (
              <Button
                variant="outline"
                size="sm"
                className="h-10 gap-2 border-destructive/20 text-destructive hover:bg-destructive/10 font-bold text-xs"
                onClick={() => handleStatusUpdate(OrderStatus.CANCELLED)}
                disabled={statusLoading}
              >
                <XCircle className="h-4 w-4" /> Cancel
              </Button>
            )}
            <Button
              variant="premium"
              size="sm"
              className="gap-2 text-xs"
              onClick={() => router.push(`/orders/new?edit=${order.id}`)}
            >
              <Plus className="h-4 w-4" /> Edit Order
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Left — Customer + Items */}
        <div className="lg:col-span-2 space-y-5">

          {/* Customer Details */}
          <Card className="shadow-sm border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-3 px-6 pt-5">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <Package className="h-3.5 w-3.5 text-primary" />
                </div>
                <CardTitle className="text-base font-bold">Customer Details</CardTitle>
              </div>
              <Button variant="ghost" size="sm" className="text-primary h-8 text-xs font-semibold hover:bg-primary/5">
                View History
              </Button>
            </CardHeader>
            <CardContent className="px-6 pb-6 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                {/* Left - Basic Info */}
                <div className="space-y-5">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 opacity-70">Name</p>
                    <p className="font-bold text-lg text-foreground leading-none">{order.customer.fullName}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 opacity-70">Phone</p>
                    <p className="font-bold text-base text-foreground/90 leading-none">{order.customer.phone}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 opacity-70">Size Number</p>
                    <p className="font-bold text-sm text-primary leading-none tracking-wider">
                      {order.customer.sizeNumber}
                    </p>
                  </div>
                </div>

                {/* Right - Measurements Summary Box */}
                <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 sm:p-5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-primary mb-4">Measurements Summary</p>
                  {(() => {
                    // Try to find measurements for the first item's garment category
                    const customerMeasurements = order.customer.measurements || [];
                    
                    // Fallback to the most recent measurement if no specific category match (or just show the first one)
                    const mSet = customerMeasurements[0];

                    if (!mSet || !mSet.values || Object.keys(mSet.values).length === 0) {
                      return <p className="text-xs text-muted-foreground italic">No measurements recorded.</p>;
                    }

                    const fields = mSet.category?.fields || [];
                    const values = mSet.values as Record<string, string>;
                    
                    // Map values to labels
                    const displayItems = Object.entries(values).map(([fieldId, value]) => {
                        const field = fields.find((f) => f.id === fieldId);
                        return { label: field?.label || fieldId, value };
                    }).slice(0, 8);

                    return (
                      <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                        {displayItems.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between group">
                            <span className="text-xs text-muted-foreground font-medium truncate pr-2">{item.label}</span>
                            <span className="text-xs font-black text-foreground shrink-0">{item.value}&quot;</span>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card className="shadow-sm border-border">
            <CardHeader className="flex flex-row items-center gap-2 pb-3 px-6 pt-5">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                <CreditCard className="h-3.5 w-3.5 text-primary" />
              </div>
              <CardTitle className="text-base font-bold">Order Items</CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-1">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-t border-b border-border bg-muted/50">
                      <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground w-16">Piece #</th>
                      <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Garment Type</th>
                      <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Assigned To</th>
                      <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Description</th>
                      <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Fabric</th>
                      <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Unit Price</th>
                      <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {order.items.map((item, idx) => {
                      const empName = employees.find(e => e.id === item.employeeId)?.fullName ?? item.employeeId ?? "—";
                      const initials = empName !== "—" ? empName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "—";
                      return (
                        <tr key={idx} className="hover:bg-muted/50 transition-colors">
                          <td className="px-6 py-5 font-bold text-foreground text-sm">#{item.pieceNo}</td>
                          <td className="px-4 py-5 font-bold text-foreground text-sm">{item.garmentTypeName}</td>
                          <td className="px-4 py-5 font-medium text-xs">
                              {item.tasks && item.tasks.length > 0 ? (
                                  <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="h-7 text-[10px] font-bold tracking-widest uppercase hover:bg-primary/5 hover:text-primary transition-colors border-primary/20"
                                      onClick={() => {
                                          setTaskItem(item);
                                          setTaskOpen(true);
                                      }}
                                  >
                                      Tasks (Piece #{item.pieceNo})
                                  </Button>
                              ) : empName !== "—" ? (
                                <div className="flex items-center gap-2.5">
                                  <div className="h-8 w-8 rounded-full bg-primary/10 text-primary text-[10px] font-black flex items-center justify-center shrink-0 border border-primary/20">
                                    {initials}
                                  </div>
                                  <span className="text-sm text-muted-foreground font-bold">{empName}</span>
                                </div>
                              ) : <span className="text-muted-foreground">Unassigned</span>}
                          </td>
                          <td className="px-4 py-5">
                            <p className="text-muted-foreground text-xs leading-relaxed max-w-[200px]">
                              {item.description || "—"}
                            </p>
                          </td>
                          <td className="px-4 py-5 text-center">
                            <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-tight">
                              {item.fabricSource}
                            </Badge>
                          </td>
                          <td className="px-4 py-5 text-right text-muted-foreground text-sm">Rs. {(item.unitPrice / 100).toLocaleString()}</td>
                          <td className="px-6 py-5 text-right font-bold text-foreground text-sm">Rs. {(item.unitPrice / 100).toLocaleString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-5">

          {/* Financial Summary */}
          <Card className="shadow-sm border-border">
            <CardHeader className="px-6 pt-5 pb-3 flex flex-row items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                <CreditCard className="h-3.5 w-3.5 text-primary" />
              </div>
              <CardTitle className="text-base font-bold">Financial Summary</CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6 pt-2 space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-medium">Subtotal</span>
                  <span className="font-bold text-foreground">Rs. {(order.subtotal / 100).toLocaleString()}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground font-medium">
                      Discount {order.discountType === 'PERCENTAGE' ? `(${order.discountValue}%)` : ''}
                    </span>
                    <span className="text-success font-bold">- Rs. {(order.discountAmount / 100).toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <div className="flex justify-between items-end">
                  <span className="text-sm font-bold text-foreground uppercase tracking-tight">Total Amount</span>
                  <span className="text-xl font-bold text-primary">Rs. {(order.totalAmount / 100).toLocaleString()}</span>
                </div>
                {order.totalPaid > 0 && (
                  <div className="flex justify-between text-[11px] text-muted-foreground mt-1.5 italic font-medium">
                    <span>Advance Paid</span>
                    <span>Rs. {(order.totalPaid / 100).toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-dashed border-border"></div>
                </div>
              </div>

              <div className="flex items-center justify-between py-4 px-5 bg-primary/5 rounded-2xl border border-primary/10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Balance Due</span>
                <span className="text-xl font-bold text-primary">Rs. {(order.balanceDue / 100).toLocaleString()}</span>
              </div>

              <Button
                variant="premium"
                size="xl"
                className="w-full mt-2"
                onClick={() => setPaymentOpen(true)}
              >
                Record Payment
              </Button>
            </CardContent>
          </Card>

          {/* Order Timeline */}
          <Card className="shadow-sm border-border">
            <CardHeader className="px-6 pt-5 pb-3 flex flex-row items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="h-3.5 w-3.5 text-primary" />
              </div>
              <CardTitle className="text-base font-bold">Order Timeline</CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6 pt-2">
              <div className="space-y-6">
                {timelineSteps.map((step, i) => {
                  const historyEntry = historyForTimeline.find(h => h.toStatus?.toLowerCase().replace("_", " ") === step.key.toLowerCase());
                  const isLast = i === timelineSteps.length - 1;
                  
                  // Styling based on state
                  let statusColor = "bg-muted border-border text-muted-foreground";
                  let Icon = null;
                  
                  if (step.done) {
                    statusColor = "bg-success/10 border-success text-success";
                    Icon = <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>;
                  } else if (step.active) {
                    statusColor = "bg-primary border-primary text-primary-foreground shadow-md shadow-primary/20";
                    Icon = <div className="h-2 w-2 rounded-full bg-foreground animate-pulse" />;
                  }

                  return (
                    <div key={i} className="flex gap-4 items-start relative">
                      {/* Vertical Line Connector */}
                      {!isLast && (
                        <div className={`absolute left-[13px] top-8 w-0.5 h-10 ${step.done ? "bg-success/20" : "bg-muted"}`} />
                      )}
                      
                      {/* Status Circle */}
                      <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 border-2 z-10 transition-colors ${statusColor}`}>
                        {Icon}
                      </div>

                      {/* Text Content */}
                      <div className="flex-1 pt-0.5">
                        <p className={`text-sm font-bold leading-none ${step.active ? "text-primary" : step.done ? "text-foreground" : "text-muted-foreground"}`}>
                          {step.key}
                        </p>
                        {historyEntry ? (
                          <div className="mt-1.5 space-y-0.5">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
                              {new Date(historyEntry.createdAt).toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" })} • {new Date(historyEntry.createdAt).toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" })}
                            </p>
                            {historyEntry.note && <p className="text-[11px] text-muted-foreground font-medium italic truncate">{historyEntry.note}</p>}
                          </div>
                        ) : step.active ? (
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight mt-1.5 animate-pulse">Processing Now</p>
                        ) : (
                           <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight mt-1.5">Pending</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Process Order actions */}
          {order.status !== OrderStatus.CANCELLED && order.status !== OrderStatus.COMPLETED && (
            <Card className="shadow-sm border-border">
              <CardContent className="px-5 py-4 space-y-2">
                {order.status === OrderStatus.NEW && (
                  <Button variant="premium" size="lg" className="w-full" onClick={() => handleStatusUpdate(OrderStatus.IN_PROGRESS)} disabled={statusLoading}>
                    {statusLoading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <ChevronRight className="h-4 w-4 mr-2" />}
                    Start Work
                  </Button>
                )}
                {order.status === OrderStatus.IN_PROGRESS && (
                  <Button className="w-full" variant="secondary" onClick={() => handleStatusUpdate(OrderStatus.READY)} disabled={statusLoading}>
                    Mark Ready for Pickup
                  </Button>
                )}
                {order.status === OrderStatus.READY && (
                  <Button className="w-full" variant="outline" onClick={() => handleStatusUpdate(OrderStatus.DELIVERED)} disabled={statusLoading}>
                    Deliver &amp; Complete
                  </Button>
                )}
                {order.status === OrderStatus.DELIVERED && (
                  <Button className="w-full" variant="outline" onClick={() => handleStatusUpdate(OrderStatus.COMPLETED)} disabled={statusLoading}>
                    Mark Fully Completed
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Payment Dialog */}
      <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Payment</DialogTitle>
            <DialogDescription>Record a payment from the customer for this order.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex justify-between items-center p-3 bg-destructive/10 rounded-lg text-destructive font-bold">
              <span>Maximum Due:</span>
              <span>Rs. {(order.balanceDue / 100).toLocaleString()}</span>
            </div>
            <div className="space-y-1.5">
              <Label>Amount (Rs.)</Label>
              <Input type="number" placeholder="e.g. 1000" value={amount} onChange={(e) => setAmount(e.target.value)} max={order.balanceDue / 100} />
            </div>
            <div className="space-y-1.5">
              <Label>Note (Optional)</Label>
              <Input placeholder="e.g. Cash, Bank Transfer" value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentOpen(false)}>Cancel</Button>
            <Button onClick={handleAddPayment} disabled={processing || !amount}>
              {processing ? "Saving..." : "Save Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      <TaskAssignmentDialog
        open={taskOpen}
        onOpenChange={setTaskOpen}
        orderItem={taskItem}
        employees={employees}
        onSuccess={fetchOrder}
      />
    </div>
  );
}

