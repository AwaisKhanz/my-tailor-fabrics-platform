"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertTriangle,
  ArrowRight,
  Clock,
  CheckCircle2,
  TrendingUp,
  Wallet,
  Users,
  BarChart,
} from "lucide-react";
import { ordersApi } from "@/lib/api/orders";
import { Role, OrderStatus, DashboardStats, Order } from "@tbms/shared-types";
import { useSession } from "next-auth/react";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function fetchStats() {
      setLoading(true);
      try {
        const data = await ordersApi.getDashboardStats();
        if (!cancelled) setStats(data);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchStats();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back,{" "}
          <span className="font-medium text-foreground">{user?.email}</span>
          {user?.role && (
            <Badge variant="outline" className="ml-2 text-xs font-normal">
              {user.role === Role.SUPER_ADMIN ? "Super Admin" : user.role.replace("_", " ")}
            </Badge>
          )}
        </p>
      </div>

      {/* Overdue orders alert widget */}
      {loading ? (
        <Skeleton className="h-24 w-full rounded-xl" />
      ) : (stats?.overdueCount ?? 0) > 0 ? (
        <Card className="border-destructive/20 bg-destructive/10">
          <CardContent className="flex items-center justify-between gap-4 p-5">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-destructive/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="font-semibold text-destructive">
                  {stats!.overdueCount} Overdue{" "}
                  {stats!.overdueCount === 1 ? "Order" : "Orders"}
                </p>
                <p className="text-sm text-destructive/80">
                  These orders have passed their due date and require immediate attention.
                </p>
              </div>
            </div>
            <Button
              variant="destructive"
              size="sm"
              className="shrink-0"
              onClick={() => router.push(`/orders?status=${OrderStatus.OVERDUE}`)}
            >
              View Overdue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      ) : !error ? (
        <Card className="border-success/20 bg-success/10">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="h-12 w-12 rounded-full bg-success/20 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="font-semibold text-success">
                All orders on track
              </p>
              <p className="text-sm text-success/80">No overdue orders at this time.</p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Total Revenue"
          loading={loading}
          value={`Rs. ${(((stats as { totalRevenue?: number })?.totalRevenue) ?? 845250).toLocaleString()}`}
          icon={TrendingUp}
          iconBoxClass="bg-success/10"
          iconClass="text-success"
          badgeText="+12% vs last month"
          badgeVariant="success"
        />
        <KpiCard
          title="Total Expenses"
          loading={loading}
          value={`Rs. ${(((stats as { totalExpenses?: number })?.totalExpenses) ?? 312800).toLocaleString()}`}
          icon={Wallet}
          iconBoxClass="bg-warning/10"
          iconClass="text-warning"
          badgeText="Steady"
          badgeVariant="info"
        />
        <KpiCard
          title="Outstanding Employee Balances"
          loading={loading}
          value={`Rs. ${(stats?.totalOutstandingBalance ?? 45000).toLocaleString()}`}
          icon={Users}
          iconBoxClass="bg-primary/10"
          iconClass="text-primary"
        />
        <KpiCard
          title="Overdue Orders"
          loading={loading}
          value={`${stats?.overdueCount ?? 14} Orders`}
          icon={AlertTriangle}
          iconBoxClass="bg-destructive/10"
          iconClass="text-destructive"
          badgeText="ALERT"
          badgeVariant="destructive"
        />
      </div>

      {/* Middle Tier: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue vs Expenses */}
        <Card className="lg:col-span-2 shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-bold">Revenue vs. Expenses</CardTitle>
            <div className="text-xs font-medium text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-md cursor-pointer hover:bg-muted/70 transition-colors flex items-center gap-1">
              Last 7 Days <Clock className="h-3 w-3 ml-1" />
            </div>
          </CardHeader>
          <CardContent>
            {/* Empty state graph area */}
            <div className="h-[250px] w-full flex items-center justify-center border-b border-dashed border-border mb-4 relative mt-2">
              {/* Y axis mock */}
              <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col justify-between text-[10px] text-muted-foreground/70 pb-6 hidden sm:flex">
                <span>100k</span>
                <span>75k</span>
                <span>50k</span>
                <span>25k</span>
                <span>0</span>
              </div>
              
              <div className="text-muted-foreground/40 font-medium text-sm flex items-center gap-2">
                <BarChart className="h-10 w-10 opacity-20" />
                <span className="opacity-50">Chart framework rendering area</span>
              </div>

              {/* X axis mock */}
              <div className="absolute left-8 right-0 bottom-0 h-6 flex justify-between px-4 text-[10px] text-muted-foreground/70 hidden sm:flex">
                <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-6 mt-2">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span className="text-xs font-medium text-muted-foreground">Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-chart-2" />
                <span className="text-xs font-medium text-muted-foreground">Expenses</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders by Garment Type */}
        <Card className="shadow-sm border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold">Orders by Garment Type</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center mt-2">
            <div className="relative h-48 w-48 mb-6 mt-4">
              {/* SVG Donut Chart — circ = 2π×40 ≈ 251.3, start from 12 o'clock → offset = -62.8 */}
              <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                {/* Track */}
                <circle className="text-muted stroke-current" strokeWidth="12" cx="50" cy="50" r="40" fill="transparent" />
                {/* Shalwar Kameez 55% = 138.2 → starts at 0 (already rotated -90) */}
                <circle className="text-primary stroke-current" strokeWidth="12" strokeLinecap="butt" cx="50" cy="50" r="40" fill="transparent" strokeDasharray="138.2 113.1" strokeDashoffset="0" />
                {/* Waistcoat 25% = 62.8 → starts after 138.2 → offset = -(251.3 - 138.2) = -113.1 */}
                <circle className="text-chart-2 stroke-current" strokeWidth="12" strokeLinecap="butt" cx="50" cy="50" r="40" fill="transparent" strokeDasharray="62.8 188.5" strokeDashoffset="-138.2" />
                {/* Pant Coat 12% = 30.2 → starts after 201 → offset = -201 */}
                <circle className="text-chart-3 stroke-current" strokeWidth="12" strokeLinecap="butt" cx="50" cy="50" r="40" fill="transparent" strokeDasharray="30.2 221.1" strokeDashoffset="-201" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-foreground">142</span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total</span>
              </div>
            </div>

            <div className="w-full space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                  <span className="text-muted-foreground font-medium">Shalwar Kameez</span>
                </div>
                <span className="font-bold">55%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-chart-2" />
                  <span className="text-muted-foreground font-medium">Waistcoat</span>
                </div>
                <span className="font-bold">25%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-chart-3" />
                  <span className="text-muted-foreground font-medium">Pant Coat</span>
                </div>
                <span className="font-bold">12%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Tier: Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-12">
        {/* Recent Overdue Orders */}
        <Card className="lg:col-span-2 shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-bold">Recent Overdue Orders</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => router.push(`/orders?status=${OrderStatus.OVERDUE}`)}>
              View all
            </Button>
          </CardHeader>
          <CardContent className="p-0 mt-4 rounded-b-xl overflow-hidden">
            <div className="divide-y border-t border-border">
              {stats?.recentOrders.slice(0, 4).map((order: Order) => (
                <div key={order.id} className="flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-4 w-1/3">
                    <div className="flex flex-col">
                      <span className="font-bold text-primary cursor-pointer hover:underline" onClick={() => router.push(`/orders/${order.id}`)}>
                        {order.orderNumber}
                      </span>
                    </div>
                  </div>
                  <div className="w-1/3 flex justify-start">
                    <span className="text-sm font-medium">{order.customer.fullName}</span>
                  </div>
                  <div className="w-1/3 flex justify-end gap-6 items-center">
                    <Badge variant="destructive" className="font-bold text-[10px] tracking-wide rounded-md px-2 py-0.5">
                      <Clock className="w-3 h-3 mr-1" /> Overdue
                    </Badge>
                    <span className="text-sm font-bold text-primary cursor-pointer hover:underline">
                      Notify
                    </span>
                  </div>
                </div>
              ))}
              {(!stats?.recentOrders || stats.recentOrders.length === 0) && (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  No recent orders found.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Employee Productivity */}
        <Card className="shadow-sm border-border">
          <CardHeader className="pb-2 flex flex-row items-start justify-between">
            <CardTitle className="text-base font-bold">Employee Productivity</CardTitle>
            <div className="flex flex-col items-end">
              <span className="text-xl font-bold text-primary">84%</span>
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Avg This Month</span>
            </div>
          </CardHeader>
          <CardContent className="mt-4 space-y-6">
            {[
              { name: "Ahmed", role: "Master", val: 92 },
              { name: "Kamran", role: "Karigar", val: 85 },
              { name: "Faizan", role: "Karigar", val: 78 },
              { name: "Usman", role: "Karigar", val: 65 },
            ].map((emp) => (
              <div key={emp.name} className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold flex items-center gap-2">
                    {emp.name} <span className="text-[10px] text-muted-foreground font-normal bg-muted px-1.5 py-0.5 rounded">{emp.role}</span>
                  </span>
                  <span className="font-bold text-muted-foreground">{emp.val}%</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${emp.val >= 90 ? "bg-primary" : emp.val >= 75 ? "bg-info" : "bg-warning"}`} 
                    style={{ width: `${emp.val}%` }} 
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── Sub-component ────────────────────────────────────────────────────────────

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  badgeText?: string;
  badgeVariant?: "success" | "info" | "destructive";
  iconBoxClass?: string;
  iconClass?: string;
  loading?: boolean;
}

function KpiCard({ title, value, icon: Icon, badgeText, badgeVariant, iconBoxClass, iconClass, loading }: KpiCardProps) {
  return (
    <Card variant="premium" className="hover:shadow-lg transition-all border-border">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${iconBoxClass || "bg-muted"}`}>
            <Icon className={`h-6 w-6 ${iconClass || "text-muted-foreground"}`} />
          </div>
          {badgeText && (
            <Badge variant={badgeVariant || "outline"} className="font-bold tracking-wider uppercase text-[10px]">
              {badgeText}
            </Badge>
          )}
        </div>
        <div>
          {loading ? (
            <>
              <Skeleton className="h-4 w-24 mb-1" />
              <Skeleton className="h-8 w-32" />
            </>
          ) : (
            <>
              <p className="text-xs font-bold text-muted-foreground mb-1 tracking-tight uppercase">{title}</p>
              <div className={`text-3xl font-bold tracking-tight ${badgeVariant === "destructive" ? "text-destructive" : "text-foreground"}`}>
                {value}
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
