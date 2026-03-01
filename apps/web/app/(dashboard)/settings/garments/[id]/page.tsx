"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Shirt, 
  ArrowLeft, 
  Settings, 
  BadgePercent, 
  IndianRupee, 
  Scale, 
  ChevronRight,
  ClipboardList,
  AlertCircle,
  TrendingUp,
  Layout
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { configApi } from "@/lib/api/config";
import type { GarmentType } from "@tbms/shared-types";
import { useBranchStore } from "@/store/useBranchStore";
import Link from "next/link";

export default function GarmentDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { activeBranchId } = useBranchStore();
  const [loading, setLoading] = useState(true);
  const [garment, setGarment] = useState<GarmentType & { 
    marginAmount: number; 
    marginPercentage: number; 
    priceOffset: number;
  } | null>(null);

  useEffect(() => {
    const fetchGarment = async () => {
      setLoading(true);
      try {
        const resp = await configApi.getGarmentType(id, activeBranchId || undefined);
        if (resp.success) {
          setGarment(resp.data as typeof garment);
        }
      } catch (err) {
        console.error("Failed to fetch garment:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchGarment();
  }, [id, activeBranchId]);

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
                           <p className="text-lg font-black text-foreground">Rs. {(garment.marginAmount / 100).toLocaleString()}</p>
                        </div>
                        <div className="space-y-1">
                           <p className="text-[10px] text-muted-foreground font-medium">Profitability</p>
                           <div className="flex items-center gap-1.5">
                              <p className="text-lg font-black text-success">{garment.marginPercentage}%</p>
                              <TrendingUp className="h-3.5 w-3.5 text-success" />
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
                          <p className="text-[10px] text-muted-foreground">{(category as typeof category & { fields?: unknown[] }).fields?.length || 0} measurement fields</p>
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
        </div>

        {/* Sidebar info / Pricing Sidebar */}
        <div className="space-y-6">
          <Card className="border-border/50 shadow-sm bg-primary/[0.02]">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <IndianRupee className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary">Active Pricing</CardTitle>
              </div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase">{activeBranchId ? "Resolved for Active Branch" : "Global Base Prices"}</p>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                   <span className="text-xs text-muted-foreground font-medium">Customer Price</span>
                   <span className="text-lg font-black">Rs. {((garment.resolvedCustomerPrice ?? 0) / 100).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                   <span className="text-xs text-muted-foreground font-medium">Employee Rate</span>
                   <span className="text-lg font-black">Rs. {((garment.resolvedEmployeeRate ?? 0) / 100).toLocaleString()}</span>
                </div>
                
                <Separator className="bg-primary/10" />

                <div className="pt-2">
                   <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Revenue Share</span>
                      <span className="text-[10px] font-black text-primary">Rs. {(garment.marginAmount / 100).toLocaleString()}</span>
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
              
              {garment.isOverridden && (
                <div className="mt-6 p-3 rounded-lg bg-success/5 border border-success/20 flex gap-3">
                   <div className="h-5 w-5 rounded bg-success/10 flex items-center justify-center shrink-0">
                      <AlertCircle className="h-3 w-3 text-success" />
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] font-bold text-success uppercase leading-none">Branch Override Active</p>
                      <p className="text-[10px] text-success/80 font-medium">
                         Prices are resolved from active branch. 
                         Difference from global: 
                         <strong> {garment.priceOffset > 0 ? " +" : ""}{garment.priceOffset / 100}</strong>
                      </p>
                   </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm pt-4">
             <CardContent>
                <div className="flex items-center gap-3">
                   <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center">
                      <IndianRupee className="h-5 w-5 text-warning" />
                   </div>
                   <div>
                      <p className="text-sm font-bold">{garment.overridesCount} Branches</p>
                      <p className="text-xs text-muted-foreground">Active custom pricing overrides.</p>
                   </div>
                </div>
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
