"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Shirt, 
  ArrowLeft, 
  Settings, 
  BadgePercent, 
  Banknote, 
  Scale, 
  ChevronRight,
  ClipboardList,
  AlertCircle,
  History,
  Users,
  Target,
  Activity,
  ArrowUpRight,
  Layout
} from "lucide-react";
import { formatPKR } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { configApi } from "@/lib/api/config";
import { ratesApi } from "@/lib/api/rates";
import { branchesApi } from "@/lib/api/branches";
import { RatesList } from "@/components/rates/RatesList";
import { CreateRateDialog } from "@/components/rates/CreateRateDialog";
import type { 
  MeasurementCategory, 
  GarmentTypeWithAnalytics, 
  Branch,
  CreateRateCardInput
} from "@tbms/shared-types";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function GarmentDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [garment, setGarment] = useState<GarmentTypeWithAnalytics | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [showCreateRate, setShowCreateRate] = useState(false);

  const fetchGarment = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await configApi.getGarmentType(id);
      if (resp.success) {
        setGarment(resp.data);
      }
    } catch (err) {
      console.error("Failed to fetch garment:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchGarment();
    
    // Fetch branches for rate dialog
    branchesApi.getBranches().then(resp => {
      if (resp.success && resp.data) {
        setBranches(resp.data.data);
      }
    });
  }, [id, fetchGarment]);

  const handleCreateRate = async (data: CreateRateCardInput) => {
    const resp = await ratesApi.create(data);
    if (resp.success) {
      fetchGarment(); // Refresh rates
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-64 col-span-2" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!garment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="bg-destructive/10 p-4 rounded-full mb-4">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <h2 className="text-xl font-bold">Garment Not Found</h2>
        <p className="text-muted-foreground mt-2">The garment you are looking for doesn&apos;t exist or has been deleted.</p>
        <Button className="mt-6" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full h-10 w-10" 
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">{garment.name}</h1>
              <Badge variant={garment.isActive ? "success" : "outline"} className="uppercase text-[10px] font-bold">
                {garment.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground mt-1 flex items-center gap-2">
              <Layout className="h-3 w-3" />
              Configuration & Pricing Model
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="outline" className="gap-2">
              <Settings className="h-4 w-4" />
              Edit Properties
           </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/50 shadow-sm transition-all hover:shadow-md bg-primary/[0.01]">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
               <ClipboardList className="h-5 w-5 text-primary" />
            </div>
            <div>
               <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Orders</p>
               <p className="text-xl font-black">{garment.analytics.totalOrders.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border/50 shadow-sm transition-all hover:shadow-md bg-warning/[0.01]">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-warning/10 flex items-center justify-center border border-warning/20">
               <Activity className="h-5 w-5 text-warning" />
            </div>
            <div>
               <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Active Items</p>
               <p className="text-xl font-black">{garment.analytics.activeOrders.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm transition-all hover:shadow-md bg-success/[0.01]">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center border border-success/20">
               <Banknote className="h-5 w-5 text-success" />
            </div>
            <div>
               <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Revenue</p>
               <p className="text-xl font-black">{formatPKR(garment.analytics.totalRevenue)}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm transition-all hover:shadow-md bg-ready/[0.01]">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-ready/10 flex items-center justify-center border border-ready/20">
               <Target className="h-5 w-5 text-ready" />
            </div>
            <div>
               <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Avg Actual Price</p>
               <p className="text-xl font-black">{formatPKR(garment.analytics.avgActualPrice)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="md:col-span-2 space-y-6">
          <Card className="overflow-hidden border-border/50 shadow-sm transition-all hover:shadow-md">
            <CardHeader className="bg-muted/30 pb-4">
              <div className="flex items-center gap-2">
                <Shirt className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary">Overview</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Description</label>
                    <p className="text-sm mt-1 leading-relaxed">
                      {garment.description || "No description provided for this garment type."}
                    </p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Sort Order</label>
                      <p className="text-sm font-bold mt-1">{garment.sortOrder}</p>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Created</label>
                      <p className="text-sm font-bold mt-1">{new Date(garment.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
                    <div className="flex items-center justify-between mb-4">
                       <label className="text-[10px] font-bold text-primary uppercase tracking-wider">Pricing Analysis</label>
                       <BadgePercent className="h-4 w-4 text-primary" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                           <p className="text-[10px] text-muted-foreground font-medium">Margin</p>
                           <p className="text-lg font-black text-foreground">{formatPKR(garment.marginAmount)}</p>
                        </div>
                        <div className="space-y-1">
                           <p className="text-[10px] text-muted-foreground font-medium">Profitability</p>
                           <div className="flex items-center gap-1.5">
                              <p className="text-lg font-black text-success">{garment.marginPercentage}%</p>
                              <Banknote className="h-3.5 w-3.5 text-success" />
                           </div>
                        </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Connected Measurement Forms */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-primary" />
                  <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary">Connected Measurement Forms</CardTitle>
                </div>
                <Badge variant="secondary" className="font-bold">
                   {(garment.measurementCategories?.length || 0)} Forms
                </Badge>
              </div>
              <CardDescription className="text-xs">
                These forms will be presented when creating an order for this garment.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {garment.measurementCategories && garment.measurementCategories.length > 0 ? (
                  garment.measurementCategories.map((category) => (
                    <Link 
                      key={category.id}
                      href={`/settings/measurements/${category.id}`}
                      className="group flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-muted/30 hover:border-primary/30 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <Scale className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-bold group-hover:text-primary transition-colors">{category.name}</p>
                          <p className="text-[10px] text-muted-foreground">{(category as MeasurementCategory & { fields?: { id: string }[] }).fields?.length || 0} measurement fields</p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                    </Link>
                  ))
                ) : (
                  <div className="col-span-full py-8 text-center bg-muted/20 rounded-xl border border-dashed border-border">
                    <p className="text-sm text-muted-foreground">No measurement forms attached.</p>
                    <p className="text-[10px] text-muted-foreground mt-1 underline cursor-pointer">Attach forms in Edit Properties</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Price History Timeline */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-3 border-b border-border/50">
               <div className="flex items-center gap-2">
                 <History className="h-4 w-4 text-primary" />
                 <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary">Recent Pricing Logs</CardTitle>
               </div>
            </CardHeader>
            <CardContent className="pt-4">
                {garment.priceLogs && garment.priceLogs.length > 0 ? (
                 <div className="space-y-6 relative before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-px before:bg-border">
                   {garment.priceLogs.map((log) => (
                      <div key={log.id} className="relative pl-8">
                         <div className="absolute left-0 top-1.5 h-5 w-5 rounded-full bg-background border-2 border-primary flex items-center justify-center z-10">
                            <ArrowUpRight className="h-2.5 w-2.5 text-primary" />
                         </div>
                         <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-bold">Price Updated</p>
                            <p className="text-[10px] font-medium text-muted-foreground">{new Date(log.createdAt).toLocaleString()}</p>
                         </div>
                         <div className="bg-muted/30 rounded-lg p-3 border border-border/50 space-y-2">
                             <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1.5 shrink-0">
                                   <Users className="h-3 w-3" /> {log.changedBy.name}
                                </span>
                             </div>
                             <div className="grid grid-cols-2 gap-4 pt-1">
                                <div>
                                   <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">Customer Price</p>
                                   <div className="flex items-center gap-2">
                                      <span className="text-xs line-through opacity-50">{formatPKR(log.oldCustomerPrice || 0)}</span>
                                      <span className="text-xs font-black text-foreground">{formatPKR(log.newCustomerPrice || 0)}</span>
                                   </div>
                                </div>
                                <div>
                                   <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">Employee Rate</p>
                                   <div className="flex items-center gap-2">
                                      <span className="text-xs line-through opacity-50">{formatPKR(log.oldEmployeeRate || 0)}</span>
                                      <span className="text-xs font-black text-foreground">{formatPKR(log.newEmployeeRate || 0)}</span>
                                   </div>
                                </div>
                             </div>
                         </div>
                      </div>
                   ))}
                 </div>
               ) : (
                 <div className="py-12 text-center text-muted-foreground">
                    <History className="h-8 w-8 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">No pricing change logs found yet.</p>
                 </div>
               )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar info / Pricing Sidebar */}
        <div className="space-y-6">
          <Card className="border-border/50 shadow-sm bg-primary/[0.02]">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Banknote className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary">Global Pricing</CardTitle>
              </div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Base Shop Rates</p>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                   <span className="text-xs text-muted-foreground font-medium">Customer Price</span>
                   <span className="text-lg font-black">{formatPKR(garment.customerPrice ?? 0)}</span>
                </div>
                <div className="flex items-center justify-between">
                   <span className="text-xs text-muted-foreground font-medium">Employee Rate</span>
                   <span className="text-lg font-black">{formatPKR(garment.employeeRate ?? 0)}</span>
                </div>
                
                <Separator className="bg-primary/10" />

                <div className="pt-2">
                   <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Revenue Share</span>
                      <span className="text-[10px] font-black text-primary">{formatPKR(garment.marginAmount)}</span>
                   </div>
                   <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary" 
                        style={{ width: `${garment.marginPercentage}%` }}
                      ></div>
                   </div>
                   <div className="flex justify-between mt-1">
                      <span className="text-[9px] text-muted-foreground font-bold italic">Owner Profit</span>
                      <span className="text-[9px] text-muted-foreground font-bold italic">Tailor Share</span>
                   </div>
                </div>
              </div>
            </CardContent>
          </Card>


          <Card className="border-border/50 shadow-sm pt-4">
             <CardHeader className="pt-0 pb-3">
               <div className="flex items-center gap-2">
                 <Banknote className="h-4 w-4 text-primary" />
                 <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary">Top Tailors</CardTitle>
               </div>
               <p className="text-[10px] text-muted-foreground font-medium uppercase italic leading-none mt-1">Efficiency Champions</p>
             </CardHeader>
             <CardContent className="space-y-3">
               {garment.analytics.topTailors.length > 0 ? (
                 garment.analytics.topTailors.map((tailor, idx) => (
                   <div key={idx} className="flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <div className={cn(
                          "h-6 w-6 rounded-md flex items-center justify-center text-[10px] font-black",
                          idx === 0 ? "bg-ready/20 text-ready" : "bg-muted text-muted-foreground"
                        )}>
                           {idx + 1}
                        </div>
                        <p className="text-sm font-bold">{tailor.name}</p>
                     </div>
                     <Badge variant="outline" className="text-[10px] font-bold border-border">{tailor.count} Orders</Badge>
                   </div>
                 ))
               ) : (
                 <p className="text-center text-xs text-muted-foreground py-4 italic">No production data yet.</p>
               )}
             </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Rates Section */}
      <Card className="border-border/50 shadow-sm mt-6">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Banknote className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary">Production Rates (Step-based)</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Define how much tailors are paid for each step of this garment.
            </CardDescription>
          </div>
          <Button 
            size="sm" 
            className="h-8 gap-2 font-bold text-[10px] uppercase tracking-wider"
            onClick={() => setShowCreateRate(true)}
          >
            <Settings className="h-3 w-3" />
            Update Rates
          </Button>
        </CardHeader>
        <CardContent>
          <RatesList rates={garment.rateCards || []} />
        </CardContent>
      </Card>

      <CreateRateDialog 
        open={showCreateRate}
        onOpenChange={setShowCreateRate}
        onSubmit={handleCreateRate}
        garmentTypes={[{ id: garment.id, name: garment.name }]}
        branches={branches.map(b => ({ id: b.id, name: b.name, code: b.code }))}
        steps={garment.workflowSteps?.map(s => s.stepKey) || []}
      />
    </div>
  );
}
