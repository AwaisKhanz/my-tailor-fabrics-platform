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
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertTriangle,
  ArrowRight,
  Clock,
  CheckCircle2,
  BarChart,
  Banknote,
} from "lucide-react";
import { formatPKR } from "@/lib/utils";
import { reportsApi, DesignAnalytics, EmployeeProductivity, GarmentRevenue } from "@/lib/api/reports";
import { Role, OrderStatus, DashboardStats, Order } from "@tbms/shared-types";
import { useSession } from "next-auth/react";
import { Users, ShoppingBag } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [designs, setDesigns] = useState<DesignAnalytics[]>([]);
  const [productivity, setProductivity] = useState<EmployeeProductivity[]>([]);
  const [garments, setGarments] = useState<GarmentRevenue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      setLoading(true);
      try {
        const [statsData, designsData, prodData, garmentsData, revExpData] = await Promise.all([
          reportsApi.getDashboardStats(),
          reportsApi.getDesigns(),
          reportsApi.getProductivity(),
          reportsApi.getGarments(),
          reportsApi.getRevenueVsExpenses(6),
        ]);
        if (!cancelled) {
          setStats(statsData);
          if (designsData.success) {
            setDesigns(designsData.data.slice(0, 5)); // Top 5
          }
          if (prodData.success) {
            setProductivity(prodData.data);
          }
          if (garmentsData.success) {
            setGarments(garmentsData.data);
          }
          if (revExpData.success) {
            // setRevExp(revExpData.data); // Removed unused state to satisfy ESLint
          }
        }
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchData();
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
            <Badge variant="admin" size="xs" className="ml-2">
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
              <Label variant="dashboard" className="text-destructive font-bold text-sm block">
                  {stats?.overdueOrders ?? 0} Overdue{" "}
                  {(stats?.overdueOrders ?? 0) === 1 ? "Order" : "Orders"}
                </Label>
                <p className="text-sm text-destructive/80">
                  These orders have passed their due date and require immediate attention.
                </p>
              </div>
            </div>
            <Button
              variant="destructive"
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
              <Label variant="dashboard" className="text-success font-bold text-sm block">
                All orders on track
              </Label>
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
          value={formatPKR(stats?.revenue ?? 0)}
          icon={Banknote}
          iconBoxClass="bg-success/10"
          iconClass="text-success"
          badgeText="LIVE"
          badgeVariant="success"
        />
        <KpiCard
          title="Active Employees"
          loading={loading}
          value={stats?.activeEmployees ?? 0}
          icon={Users}
          iconBoxClass="bg-primary/10"
          iconClass="text-primary"
        />
        <KpiCard
          title="Total Customers"
          loading={loading}
          value={stats?.totalCustomers ?? 0}
          icon={Users}
          iconBoxClass="bg-info/10"
          iconClass="text-info"
        />
        <KpiCard
          title="New Today"
          loading={loading}
          value={stats?.newToday ?? 0}
          icon={ShoppingBag}
          iconBoxClass="bg-warning/10"
          iconClass="text-warning"
          badgeText="Orders"
          badgeVariant="info"
        />
      </div>

      {/* Middle Tier: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue vs Expenses */}
        <Card className="lg:col-span-2 shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle variant="dashboard">Revenue vs. Expenses</CardTitle>
            <div className="hover:bg-muted/70 transition-colors flex items-center gap-1">
              <Label variant="dashboard">Last 7 Days</Label> <Clock className="h-3 w-3 ml-1" />
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
            <CardTitle variant="dashboard">Orders by Garment Type</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center mt-2">
            <div className="relative h-48 w-48 mb-6 mt-4">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                <circle className="text-muted stroke-current" strokeWidth="12" cx="50" cy="50" r="40" fill="transparent" />
                {garments.slice(0, 3).map((g, i) => {
                  const total = garments.reduce((sum, current) => sum + current.value, 0);
                  const percentage = total > 0 ? (g.value / total) * 100 : 0;
                  const strokeDash = (percentage * 251.3) / 100;
                  let offset = 0;
                  for (let j = 0; j < i; j++) {
                    const prevPerc = (garments[j].value / total) * 100;
                    offset += (prevPerc * 251.3) / 100;
                  }
                  const colors = ["text-primary", "text-chart-2", "text-chart-3"];
                  return (
                    <circle 
                      key={g.label}
                      className={`${colors[i % colors.length]} stroke-current`} 
                      strokeWidth="12" 
                      strokeLinecap="butt" 
                      cx="50" 
                      cy="50" 
                      r="40" 
                      fill="transparent" 
                      strokeDasharray={`${strokeDash} 251.3`} 
                      strokeDashoffset={-offset} 
                    />
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-foreground">{garments.reduce((sum, g) => sum + g.value, 0)}</span>
                <Label variant="dashboard">Total Items</Label>
              </div>
            </div>

            <div className="w-full space-y-3">
              {garments.slice(0, 3).map((g, i) => {
                const colors = ["bg-primary", "bg-chart-2", "bg-chart-3"];
                const total = garments.reduce((sum, current) => sum + current.value, 0);
                const percentage = total > 0 ? Math.round((g.value / total) * 100) : 0;
                return (
                  <div key={g.label} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className={`h-2.5 w-2.5 rounded-full ${colors[i % colors.length]}`} />
                      <span className="text-muted-foreground font-medium">{g.label}</span>
                    </div>
                    <span className="font-bold">{percentage}%</span>
                  </div>
                );
              })}
              {garments.length === 0 && (
                <div className="text-center text-xs text-muted-foreground">No data</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Design Popularity (New Widget) */}
        <Card className="shadow-sm border-border">
          <CardHeader className="pb-2">
            <CardTitle variant="dashboard">Design Popularity</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="space-y-4">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-2 w-full" />
                  </div>
                ))
              ) : designs.length === 0 ? (
                <div className="h-40 flex items-center justify-center text-xs text-muted-foreground ">
                  No design data found
                </div>
              ) : (
                designs.map((design) => (
                  <div key={design.name} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <Label variant="dashboard">{design.name}</Label>
                      <span className="font-medium text-muted-foreground">{design.count}</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${(design.count / Math.max(...designs.map(d => d.count), 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <Button 
              variant="dashboard" 
              size="sm" 
              className="w-full mt-6 h-8"
              onClick={() => router.push('/reports')}
            >
              View Full Analytics
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Tier: Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-12">
        {/* Recent Overdue Orders */}
        <Card className="lg:col-span-2 shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle variant="dashboard">Recent Overdue Orders</CardTitle>
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
                    <Label variant="dashboard" className="opacity-100">{order.customer.fullName}</Label>
                  </div>
                  <div className="w-1/3 flex justify-end gap-6 items-center">
                    <Badge variant="destructive" size="xs">
                      <Clock className="w-3 h-3 mr-1" /> Overdue
                    </Badge>
                    <Label variant="dashboard" className="text-primary cursor-pointer hover:underline">
                      Notify
                    </Label>
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
            <CardTitle variant="dashboard">Employee Productivity</CardTitle>
            <div className="flex flex-col items-end">
              <span className="text-xl font-bold text-primary">84%</span>
              <Label variant="dashboard">Avg This Month</Label>
            </div>
          </CardHeader>
          <CardContent className="mt-4 space-y-6">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-2 w-full" />
                </div>
              ))
            ) : productivity.length === 0 ? (
              <div className="text-center text-xs text-muted-foreground  py-8">
                No productivity data for this period
              </div>
            ) : (
              productivity.map((emp) => {
                const maxVal = Math.max(...productivity.map(p => p.value), 1);
                const perc = Math.round((emp.value / maxVal) * 100);
                return (
                  <div key={emp.label} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-bold flex items-center gap-2">
                        {emp.label}
                      </span>
                      <Label variant="dashboard">{emp.value} Items</Label>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${perc >= 90 ? "bg-primary" : perc >= 75 ? "bg-info" : "bg-warning"}`} 
                        style={{ width: `${perc}%` }} 
                      />
                    </div>
                  </div>
                );
              })
            )}
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
              <Badge variant={badgeVariant || "outline"} size="xs">
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
              <Label variant="dashboard" className="mb-1">{title}</Label>
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
