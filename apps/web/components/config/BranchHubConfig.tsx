"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { 
  Shirt,
  ChevronRight,
  MapPin,
  Phone as PhoneIcon,
  Users,
  Briefcase
} from "lucide-react";
import { branchesApi } from "@/lib/api/branches";
import { Branch } from "@tbms/shared-types";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

interface BranchHubConfigProps {
  branchId: string;
}

export function BranchHubConfig({ branchId }: BranchHubConfigProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [branch, setBranch] = useState<Branch | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await branchesApi.getBranch(branchId);
      if (response.success) {
          setBranch(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch hub config:", error);
      toast({ title: "Error", description: "Failed to load branch data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [branchId, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return <HubSkeleton />;

  return (
    <div className="max-w-9xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2">
        <Link href="/" className="hover:text-primary transition-colors">
          <Label variant="dashboard" className="cursor-pointer">Home</Label>
        </Link>
        <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
        <Link href="/settings/branches" className="hover:text-primary transition-colors">
          <Label variant="dashboard" className="cursor-pointer">Branches</Label>
        </Link>
        <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
        <Label variant="dashboard" className="opacity-100 text-foreground">{branch?.name || 'Branch'} Overview</Label>
      </nav>

      {/* Main Header + Profile */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-4 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-4xl font-extrabold tracking-tight text-foreground">{branch?.name || 'Branch Overview'}</h1>
              <Badge variant={branch?.isActive ? "success" : "outline"} size="xs">
                {branch?.isActive ? 'Active' : 'Inactive'}
              </Badge>
              <Badge variant="secondary" size="xs">
                {branch?.code}
              </Badge>
            </div>
            
            <div className="flex flex-wrap items-center gap-6 text-sm">
              {branch?.address && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="font-semibold">{branch.address}</span>
                </div>
              )}
              {branch?.phone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <PhoneIcon className="h-4 w-4 text-primary" />
                  <span className="font-semibold">{branch.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Branch Relations Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6 bg-card border border-border rounded-xl shadow-sm">
            <div className="flex items-center gap-4 border-b sm:border-b-0 sm:border-r border-border pb-4 sm:pb-0 pr-6">
              <div className="h-12 w-12 rounded-2xl bg-chart-1/10 flex items-center justify-center shrink-0 border border-chart-1/20 group-hover:scale-110 transition-transform">
                <Users className="h-6 w-6 text-chart-1" />
              </div>
              <div className="flex flex-col">
                <Label variant="dashboard" className="mb-0.5">Employees</Label>
                <span className="text-2xl font-black text-foreground">{branch?._count?.employees || 0}</span>
              </div>
            </div>
           <div className="flex items-center gap-4 border-b sm:border-b-0 lg:border-r border-border pb-4 sm:pb-0 pr-4 sm:pl-4">
              <div className="h-10 w-10 rounded-lg bg-chart-2/10 flex items-center justify-center shrink-0">
                <Users className="h-5 w-5 text-chart-2" />
              </div>
              <div className="flex flex-col">
                <Label variant="dashboard" className="mb-0.5">Customers</Label>
                <span className="text-xl font-extrabold text-foreground">{branch?._count?.customers || 0}</span>
              </div>
           </div>
           <div className="flex items-center gap-4 pt-4 sm:pt-0 pl-0 sm:pl-6">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 group-hover:scale-110 transition-transform">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <div className="flex flex-col">
                <Label variant="dashboard" className="mb-0.5">Orders</Label>
                <span className="text-2xl font-black text-foreground">{branch?._count?.orders || 0}</span>
              </div>
           </div>
        </div>
      </div>

      {/* Global Pricing Info Card */}
      <div className="bg-muted/30 rounded-2xl border-2 border-dashed border-border p-12 text-center max-w-2xl mx-auto mt-12">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
             <Shirt className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-black text-foreground">Global Pricing Active</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
            This branch follows the company-wide pricing model. Individual branch overrides are no longer permitted.
          </p>
          <Button variant="premium" className="mt-8" asChild>
             <Link href="/settings/garments">
                Manage Global Price List
             </Link>
          </Button>
      </div>
    </div>
  );
}

function HubSkeleton() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-pulse p-10">
      <Skeleton className="h-4 w-64 mb-4" />
      <Skeleton className="h-12 w-96 mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
      </div>
      <Skeleton className="h-64 rounded-xl mt-12" />
    </div>
  );
}
