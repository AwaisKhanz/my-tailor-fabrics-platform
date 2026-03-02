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
import { DataTable, ColumnDef } from "@/components/ui/data-table";

import {
  Clock,
  CreditCard,
  Package,
  Printer,
  ChevronRight,
  Loader2,
  Plus,
  XCircle,
  Scissors,
  Check,
  Calendar,
  Share2,
  Copy
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";


import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TaskAssignmentDialog } from "./TaskAssignmentDialog";

import { formatDate, formatPKR } from "@/lib/utils";

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

  const [shareOpen, setShareOpen] = useState(false);
  const [shareData, setShareData] = useState<{ token: string; pin: string } | null>(null);
  const [sharing, setSharing] = useState(false);

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

  const handleShare = async () => {
    if (!order) return;
    setSharing(true);
    try {
      const res = await ordersApi.shareOrder(order.id);
      if (res.success) {
        setShareData(res.data as { token: string; pin: string });
        setShareOpen(true);
      }
    } catch {
      toast({ title: "Error", description: "Failed to generate share link", variant: "destructive" });
    } finally {
      setSharing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
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

  const columns: ColumnDef<OrderItem>[] = [
    {
      header: "Piece #",
      cell: (item) => (
        <span className="font-bold text-foreground">#{item.pieceNo}</span>
      )
    },
    {
      header: "Garment Type",
      cell: (item) => (
        <div className="flex items-center gap-2">
          <Scissors className="h-3.5 w-3.5 text-muted-foreground opacity-50" />
          <div className="flex flex-col">
            <span className="font-bold text-foreground">{item.garmentTypeName}</span>
            {item.designType && (
              <span className="text-[10px] text-primary font-bold uppercase tracking-wider">
                {item.designType.name}
              </span>
            )}
          </div>
        </div>
      )
    },
    {
      header: "Production Tasks",
      cell: (item) => {
        const empName = employees.find(e => e.id === item.employeeId)?.fullName ?? item.employeeId ?? "—";
        const initials = empName !== "—" ? empName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "—";
        
        return (
          <div className="min-w-[180px]">
            {item.tasks && item.tasks.length > 0 ? (
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 text-[10px] font-bold tracking-widest uppercase hover:bg-primary/5 hover:text-primary transition-all border-primary/20 bg-primary/5 text-primary"
                onClick={() => {
                  setTaskItem(item);
                  setTaskOpen(true);
                }}
              >
                Manage Tasks
              </Button>
            ) : empName !== "—" ? (
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center shrink-0 border border-primary/20">
                  {initials}
                </div>
                <span className="text-sm text-muted-foreground font-bold">{empName}</span>
              </div>
            ) : <span className="text-muted-foreground text-xs ">Unassigned</span>}
          </div>
        )
      }
    },
    {
      header: "Description",
      cell: (item) => (
        <div className="space-y-1">
          <p className="text-muted-foreground text-xs leading-relaxed max-w-[200px] truncate">
            {item.description || "—"}
          </p>
          {item.addons && item.addons.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {item.addons.map((a, i) => (
                <Badge key={i} variant="outline" className="text-[8px] px-1 h-4 border-dashed">
                  {a.name}: +{formatPKR(a.price)}
                </Badge>
              ))}
            </div>
          )}
        </div>
      )
    },
    {
      header: "Fabric",
      align: "center",
      cell: (item) => (
        <Badge variant="royal" className="text-[9px] font-bold uppercase tracking-tight px-2 py-0.5">
          {item.fabricSource}
        </Badge>
      )
    },
    {
      header: "Unit Price",
      align: "right",
      cell: (item) => (
        <span className="text-xs text-muted-foreground">{formatPKR(item.unitPrice)}</span>
      )
    },
    {
      header: "Total",
      align: "right",
      cell: (item) => {
        const addonsTotal = (item.addons || []).reduce((acc, a) => acc + a.price, 0);
        const designPrice = item.designType?.defaultPrice || 0;
        const total = (item.unitPrice * item.quantity) + (designPrice * item.quantity) + addonsTotal;
        return (
          <div className="flex flex-col items-end">
            <span className="font-bold text-foreground">{formatPKR(total)}</span>
            {(addonsTotal > 0 || designPrice > 0) && (
              <span className="text-[9px] text-muted-foreground">
                {designPrice > 0 ? `Incl. ${formatPKR(designPrice)} design` : ''}
                {addonsTotal > 0 ? `${designPrice > 0 ? ' & ' : 'Incl. '}${formatPKR(addonsTotal)} addons` : ''}
              </span>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-6 max-w-9xl mx-auto">

      {/* Breadcrumb + Page Header */}
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
        <span
          className="hover:text-primary cursor-pointer transition-colors"
          onClick={() => router.push("/orders")}
        >
          Order Index
        </span>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">{order.orderNumber}</span>
      </div>

      {/* Header Card */}
      <Card className="shadow-sm border-border overflow-hidden ring-1 ring-border/50">
        <CardContent className="px-6 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-muted/5">
          <div>
            <div className="flex items-center gap-4 flex-wrap">
              <h1 className="text-4xl font-bold tracking-tight text-foreground">{order.orderNumber}</h1>
              <Badge variant={sc.variant} size="xs" className="uppercase font-bold ring-1 ring-border">
                {sc.label}
              </Badge>
            </div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-2 flex items-center gap-2">
              <Calendar className="h-3 w-3 opacity-40" /> {formatDate(order.createdAt)} 
              <span className="opacity-20">|</span> 
              <Clock className="h-3 w-3 opacity-40" /> Due: {formatDate(order.dueDate)}
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Button 
              variant="outline" 
              size="lg" 
              className="gap-2 font-bold text-xs ring-1 ring-border shadow-sm" 
              onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/orders/${order.id}/receipt`, '_blank')}
            >
              <Printer className="h-4 w-4" /> Print Receipt
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="gap-2 font-bold text-xs ring-1 ring-border shadow-sm"
              onClick={handleShare}
              disabled={sharing}
            >
              <Share2 className="h-4 w-4" /> Share Status
            </Button>
            {order.status !== OrderStatus.CANCELLED && order.status !== OrderStatus.COMPLETED && (
              <Button
                variant="ghost"
                size="lg"
                className="gap-2 text-destructive hover:bg-destructive/10 font-bold text-xs"
                onClick={() => handleStatusUpdate(OrderStatus.CANCELLED)}
                disabled={statusLoading}
              >
                <XCircle className="h-4 w-4" /> Cancel Order
              </Button>
            )}
            <Button
              variant="premium"
              size="lg"
              className="gap-2 text-xs font-bold shadow-lg shadow-primary/20"
              onClick={() => router.push(`/orders/new?edit=${order.id}`)}
            >
              <Plus className="h-4 w-4" /> Edit Order
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left — Customer + Items */}
        <div className="lg:col-span-2 space-y-6">

          {/* Customer Details */}
          <Card className="shadow-sm border-border overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-4 px-6 pt-5 bg-muted/5 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center ring-1 ring-primary/20">
                  <Package className="h-4 w-4 text-primary" />
                </div>
                <CardTitle variant="dashboard">Customer Insight</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-6 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                {/* Left - Basic Info */}
                <div className="space-y-6">
                  <div className="space-y-1">
                    <Label variant="dashboard" className="opacity-50">Legal Name</Label>
                    <p className="font-bold text-2xl text-foreground tracking-tight">{order.customer.fullName}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label variant="dashboard" className="opacity-50">Contact info</Label>
                      <p className="font-bold text-sm text-foreground/90">{order.customer.phone}</p>
                    </div>
                    <div className="space-y-1 text-right">
                      <Label variant="dashboard" className="opacity-50">Global ID</Label>
                      <Badge variant="outline" className="font-bold text-[10px] tracking-tight uppercase">
                        {order.customer.sizeNumber}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Right - Measurements Summary Box */}
                <div className="bg-muted/30 border border-border/50 rounded-2xl p-6 ring-1 ring-inset ring-white/10 shadow-inner">
                  <div className="flex items-center justify-between mb-4">
                    <Label variant="dashboard">Measurements Profile</Label>
                    <Badge variant="info" size="xs">SYNCED</Badge>
                  </div>
                  {(() => {
                    const customerMeasurements = order.customer.measurements || [];
                    const mSet = customerMeasurements[0];

                    if (!mSet || !mSet.values || Object.keys(mSet.values).length === 0) {
                      return <p className="text-xs text-muted-foreground  text-center py-4">No bio-metric data recorded.</p>;
                    }

                    const fields = mSet.category?.fields || [];
                    const values = mSet.values as Record<string, string>;
                    const displayItems = Object.entries(values).map(([fieldId, value]) => {
                        const field = fields.find((f) => f.id === fieldId);
                        return { label: field?.label || fieldId, value };
                    }).slice(0, 8);

                    return (
                      <div className="grid grid-cols-2 gap-x-8 gap-y-3.5">
                        {displayItems.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between group">
                            <Label variant="dashboard" className="truncate pr-2 opacity-60 group-hover:opacity-100 transition-opacity">{item.label}</Label>
                            <span className="text-xs font-bold text-foreground shrink-0 tabular-nums">{item.value}&quot;</span>
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
          <div className="space-y-3">
             <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                   <CardTitle variant="dashboard">Hardware / Garment Pieces</CardTitle>
                   <Badge variant="secondary" size="xs">{order.items.length} UNITS</Badge>
                </div>
             </div>
             <Card className="shadow-sm border-border overflow-hidden">
               <DataTable
                 columns={columns}
                 data={order.items}
                 itemLabel="pieces"
                 emptyMessage="No pieces found for this order."
               />
             </Card>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">

          {/* Financial Summary */}
          <Card className="shadow-sm border-border overflow-hidden">
            <CardHeader className="px-6 pt-5 pb-4 bg-muted/5 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center ring-1 ring-primary/20">
                  <CreditCard className="h-4 w-4 text-primary" />
                </div>
                <CardTitle variant="dashboard">Financial Ledger</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-6 pt-6 space-y-5">
              <div className="space-y-3 bg-muted/20 p-4 rounded-xl border border-border/50">
                <div className="flex justify-between text-xs">
                  <Label variant="dashboard" className="opacity-60">Base Subtotal</Label>
                  <span className="font-bold text-foreground tabular-nums">{formatPKR(order.subtotal)}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-success font-bold uppercase tracking-widest opacity-80">
                      Discounts {order.discountType === 'PERCENTAGE' ? `(${order.discountValue}%)` : ''}
                    </span>
                    <span className="text-success font-bold tabular-nums">- {formatPKR(order.discountAmount)}</span>
                  </div>
                )}
              </div>
    
              <div className="px-1">
                <div className="flex justify-between items-end border-b border-border/30 pb-4">
                  <span className="text-[10px] font-bold text-foreground uppercase tracking-tight">Net Invoice</span>
                  <span className="text-3xl font-bold text-primary tracking-tight tabular-nums">{formatPKR(order.totalAmount)}</span>
                </div>
                {order.totalPaid > 0 && (
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-3 uppercase tracking-widest font-bold font-mono">
                    <span>Deposits Received</span>
                    <span className="text-foreground">{formatPKR(order.totalPaid)}</span>
                  </div>
                )}
              </div>
    
              <div className="flex items-center justify-between py-5 px-6 bg-primary text-primary-foreground rounded-2xl shadow-xl shadow-primary/20 ring-1 ring-white/20">
                <span className="text-[10px] font-bold uppercase tracking-tight">Balance Pending</span>
                <span className="text-2xl font-bold tabular-nums tracking-tight">{formatPKR(order.balanceDue)}</span>
              </div>

              <Button
                variant="premium"
                size="lg"
                className="w-full font-bold uppercase tracking-tight text-xs h-14 shadow-lg shadow-primary/30"
                onClick={() => setPaymentOpen(true)}
              >
                Capture Payment
              </Button>
            </CardContent>
          </Card>

          {/* Order Timeline */}
          <Card className="shadow-sm border-border overflow-hidden">
            <CardHeader className="px-6 pt-5 pb-4 bg-muted/5 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center ring-1 ring-primary/20">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                <CardTitle variant="dashboard">Workflow Timeline</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-6 pt-6">
              <div className="space-y-8">
                {timelineSteps.map((step, i) => {
                  const historyEntry = historyForTimeline.find(h => h.toStatus?.toLowerCase().replace("_", " ") === step.key.toLowerCase());
                  const isLast = i === timelineSteps.length - 1;
                  
                  let statusColor = "bg-muted border-border text-muted-foreground";
                  let Icon = null;
                  
                  if (step.done) {
                    statusColor = "bg-success border-success text-success-foreground shadow-sm shadow-success/20";
                    Icon = <Check className="h-3 w-3 stroke-[4]" />;
                  } else if (step.active) {
                    statusColor = "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/30 ring-2 ring-primary/20";
                    Icon = <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />;
                  }

                  return (
                    <div key={i} className="flex gap-5 items-start relative">
                      {!isLast && (
                        <div className={`absolute left-[13px] top-8 w-[2px] h-10 ${step.done ? "bg-success/30" : "bg-border/50"}`} />
                      )}
                      
                      <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 border transition-all duration-300 z-10 ${statusColor}`}>
                        {Icon}
                      </div>

                      <div className="flex-1 pt-0.5">
                        <p className={`text-xs font-bold uppercase tracking-tight border-b border-transparent inline-block ${step.active ? "text-primary border-primary/20 pb-0.5" : step.done ? "text-foreground" : "text-muted-foreground opacity-40"}`}>
                          {step.key}
                        </p>
                        {historyEntry ? (
                          <div className="mt-2 space-y-0.5">
                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight opacity-60">
                              {new Date(historyEntry.createdAt).toLocaleDateString("en-PK", { day: "2-digit", month: "short" })} @ {new Date(historyEntry.createdAt).toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" })}
                            </p>
                            {historyEntry.note && <p className="text-[10px] text-muted-foreground font-bold  truncate opacity-80">{historyEntry.note}</p>}
                          </div>
                        ) : step.active ? (
                          <div className="mt-2 flex items-center gap-1.5">
                             <span className="h-1 w-1 rounded-full bg-success animate-ping" />
                             <p className="text-[9px] font-bold text-success uppercase tracking-tight">Current Status</p>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Process Order actions */}
          {order.status !== OrderStatus.CANCELLED && order.status !== OrderStatus.COMPLETED && (
            <Card className="shadow-sm border-border overflow-hidden">
               <CardHeader className="px-5 pt-4 pb-0">
                  <CardTitle className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground opacity-50 text-center">Lifecycle Advancement</CardTitle>
               </CardHeader>
              <CardContent className="px-5 py-5 space-y-3">
                {order.status === OrderStatus.NEW && (
                  <Button variant="premium" size="lg" className="w-full shadow-lg shadow-primary/20" onClick={() => handleStatusUpdate(OrderStatus.IN_PROGRESS)} disabled={statusLoading}>
                    {statusLoading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <ChevronRight className="h-4 w-4 mr-2" />}
                    Begin Production
                  </Button>
                )}
                {order.status === OrderStatus.IN_PROGRESS && (
                  <Button className="w-full bg-foreground text-background hover:bg-foreground/90 font-bold h-12 uppercase tracking-tight text-[10px]" onClick={() => handleStatusUpdate(OrderStatus.READY)} disabled={statusLoading}>
                    Mark Ready for trial
                  </Button>
                )}
                {order.status === OrderStatus.READY && (
                  <Button className="w-full border-primary/20 hover:bg-primary/5 text-primary font-bold h-12 uppercase tracking-tight text-[10px]" variant="outline" onClick={() => handleStatusUpdate(OrderStatus.DELIVERED)} disabled={statusLoading}>
                    Dispatch Piece
                  </Button>
                )}
                {order.status === OrderStatus.DELIVERED && (
                  <Button className="w-full shadow-xl font-bold h-12 uppercase tracking-tight text-[10px]" variant="premium" onClick={() => handleStatusUpdate(OrderStatus.COMPLETED)} disabled={statusLoading}>
                    Seal Order
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Payment Dialog */}
      <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Capture Receipt</DialogTitle>
            <DialogDescription>Input financial deposit for Order <strong>#{order.orderNumber}</strong>.</DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="flex justify-between items-center px-5 py-4 bg-muted border border-border/50 rounded-2xl">
              <span className="text-[10px] font-bold uppercase tracking-tight opacity-50">Pending amount</span>
              <span className="text-xl font-bold text-foreground tabular-nums">{formatPKR(order.balanceDue)}</span>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-tight">Deposit Amount (Rs.) <span className="text-destructive">*</span></Label>
              <Input type="number" variant="premium" className="h-12 font-bold text-lg" placeholder="e.g. 1000" value={amount} onChange={(e) => setAmount(e.target.value)} max={order.balanceDue / 100} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-tight">Transaction Note</Label>
              <Input variant="premium" className="h-12" placeholder="e.g. Received via Cash / Bank Transfer" value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
          </div>
          <DialogFooter className="border-t pt-4">
            <Button variant="outline" onClick={() => setPaymentOpen(false)}>Dismiss</Button>
            <Button variant="premium" size="lg" onClick={handleAddPayment} disabled={processing || !amount}>
              {processing ? "Syncing..." : "Post Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      <TaskAssignmentDialog
        orderItem={taskItem}
        employees={employees}
        onSuccess={fetchOrder}
        open={taskOpen}
        onOpenChange={setTaskOpen}
      />

      {/* Share Dialog */}
      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Public Status Share</DialogTitle>
            <DialogDescription>Share this link with your customer so they can track their order status.</DialogDescription>
          </DialogHeader>
          {shareData && (
            <div className="space-y-6 py-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground">Public URL</Label>
                <div className="flex gap-2">
                  <Input 
                    readOnly 
                    value={`${window.location.origin}/status/${shareData.token}`}
                    className="flex-1 font-mono text-xs bg-muted/30"
                  />
                  <Button size="icon" variant="outline" onClick={() => copyToClipboard(`${window.location.origin}/status/${shareData.token}`)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-center justify-between">
                <div>
                   <p className="text-[10px] font-bold uppercase tracking-tight text-primary/60">Access PIN</p>
                   <p className="text-3xl font-bold text-primary tracking-tight">{shareData.pin}</p>
                </div>
                <Button size="sm" variant="ghost" className="text-primary font-bold" onClick={() => copyToClipboard(shareData.pin)}>
                  Copy PIN
                </Button>
              </div>
              
              <p className="text-[10px] text-muted-foreground font-bold  text-center">
                * Customers will need the 4-digit PIN to access their order details.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" className="w-full" onClick={() => setShareOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
