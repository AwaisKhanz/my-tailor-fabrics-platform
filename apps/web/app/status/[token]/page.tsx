"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { AlertCircle, Clock, CheckCircle2, Truck, AlertTriangle } from "lucide-react";
import { siteConfig } from "@/lib/config";
import Image from "next/image";
import { formatPKR } from "@/lib/utils";
import type { OrderStatus } from "@/types/orders";
import type { Order } from "@/types/orders";

// ─── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; variant: "outline" | "warning" | "ready" | "destructive" | "info" | "success"; icon: React.ElementType }
> = {
  NEW: { label: "New", variant: "outline", icon: AlertCircle },
  IN_PROGRESS: { label: "In Progress", variant: "warning", icon: Clock },
  READY: { label: "Ready for Pickup", variant: "ready", icon: CheckCircle2 },
  OVERDUE: { label: "Overdue", variant: "destructive", icon: AlertTriangle },
  DELIVERED: { label: "Delivered", variant: "info", icon: Truck },
  COMPLETED: { label: "Completed", variant: "success", icon: CheckCircle2 },
  CANCELLED: { label: "Cancelled", variant: "outline", icon: AlertCircle },
};

// ─── Page component ────────────────────────────────────────────────────────────

export default function OrderStatusPage({ params }: { params: { token: string } }) {
  const { token } = params;
  const [pin, setPin] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 4) {
      setError("Please enter your 4-digit PIN.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/status/${token}?pin=${pin}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.message ?? "Invalid PIN or link. Please check and try again.");
      } else {
        setOrder(json.data);
        setSubmitted(true);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-card rounded-2xl shadow-xl p-8 space-y-6 border border-border">
          <div className="text-center">
            <div className="h-16 w-16 rounded-2xl bg-primary/5 flex items-center justify-center mx-auto mb-4 border border-border/50 overflow-hidden">
               <Image 
                 src={siteConfig.branding.logo} 
                 alt={siteConfig.name} 
                 width={64} 
                 height={64} 
                 className="object-contain p-2"
               />
            </div>
            <h1 className="text-xl font-bold text-foreground">Track Your Order</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Enter the 4-digit PIN from {siteConfig.shortName} to view your order status.
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <Input
                type="text"
                variant="premium"
                inputMode="numeric"
                maxLength={4}
                pattern="\d{4}"
                placeholder="Enter PIN (e.g. 1234)"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                className="text-center text-2xl tracking-widest font-bold h-14"
                autoFocus
              />
              {error && (
                <p className="text-xs text-destructive mt-1.5">{error}</p>
              )}
            </div>
            <Button type="submit" variant="premium" className="w-full h-12" disabled={loading}>
              {loading ? "Verifying..." : "View Order Status"}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground">
            This link was shared by the tailor shop. It expires when the order is completed.
          </p>
        </div>
      </div>
    );
  }

  if (!order) return null;
  const cfg = STATUS_CONFIG[order.status];
  const StatusIcon = cfg.icon;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-lg mx-auto space-y-4 pt-8">
        {/* Header */}
        <Card variant="premium" className="p-6 text-center">
          <p className="text-xs text-muted-foreground mb-1">Order Number</p>
          <h1 className="text-2xl font-bold tracking-tight text-primary">{order.orderNumber}</h1>
          <div className="mt-3 flex justify-center">
            <Badge variant={cfg.variant} className="px-4 py-1.5 text-sm font-semibold uppercase tracking-wider">
              <StatusIcon className="h-4 w-4 mr-1.5" />
              {cfg.label}
            </Badge>
          </div>
        </Card>

        {/* Order details */}
        <Card variant="premium" className="p-6 space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Details</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Customer</p>
              <p className="font-medium">{order.customer?.fullName}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Due Date</p>
              <p className="font-medium">{new Date(order.dueDate).toLocaleDateString("en-PK")}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="font-medium">{formatPKR(order.totalAmount)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Balance Due</p>
              <p className="font-medium text-destructive">{formatPKR(order.balanceDue)}</p>
            </div>
          </div>
        </Card>

        {/* Items */}
        <Card variant="premium" className="p-6 space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Items</h2>
          <div className="divide-y">
            {order.items.map((item) => (
              <div key={item.id} className="py-2 flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium">{item.garmentTypeName}</p>
                  {item.description && (
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-medium">×{item.quantity}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatPKR(item.unitPrice * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <p className="text-center text-xs text-muted-foreground pb-8">
          &copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.<br />
          Contact us at {siteConfig.contact.phone} for any concerns.
        </p>
      </div>
    </div>
  );
}
