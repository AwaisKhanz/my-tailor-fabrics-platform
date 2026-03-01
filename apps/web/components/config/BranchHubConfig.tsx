"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Badge } from "@/components/ui/badge";
import { 
  Shirt,
  ChevronRight,
  Edit2,
  Trash2,
  MapPin,
  Phone as PhoneIcon,
  Users,
  Briefcase,
  History,
  SearchIcon
} from "lucide-react";
import { branchesApi } from "@/lib/api/branches";
import { configApi } from "@/lib/api/config";
import { Branch, GarmentType } from "@tbms/shared-types";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { DataTable, ColumnDef } from "@/components/ui/data-table";
import { useDebounce } from "@/hooks/use-debounce";
import { GarmentTypeDialog } from "./GarmentTypeDialog";
import { BranchPriceHistoryDialog } from "./BranchPriceHistoryDialog";
import { Clock } from "lucide-react";

/** GarmentType extended with branch-scope computed fields returned by the API */
interface GarmentTypeWithOverride extends GarmentType {
  resolvedCustomerPrice: number;
  resolvedEmployeeRate: number;
  priceOffset: number;
  isOverridden: boolean;
}

interface BranchHubConfigProps {
  branchId: string;
}

export function BranchHubConfig({ branchId }: BranchHubConfigProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [branch, setBranch] = useState<Branch | null>(null);
  const [garmentTypes, setGarmentTypes] = useState<GarmentTypeWithOverride[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedGarment, setSelectedGarment] = useState<GarmentTypeWithOverride | null>(null);
  const [isOverrideDialogOpen, setIsOverrideDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [branchRes, garmentsRes] = await Promise.all([
        branchesApi.getBranch(branchId),
        configApi.getGarmentTypes({ 
          branchId, 
          search: debouncedSearch, 
          page: currentPage, 
          limit: itemsPerPage 
        })
      ]);

      if (branchRes.success) {
          setBranch(branchRes.data);
      }
      
      if (garmentsRes.success) {
        setGarmentTypes(garmentsRes.data.data as GarmentTypeWithOverride[]);
        setTotalCount(garmentsRes.data.total);
      }
    } catch (error) {
      console.error("Failed to fetch hub config:", error);
      toast({ title: "Error", description: "Failed to load configuration", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [branchId, debouncedSearch, currentPage, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEdit = (item: GarmentTypeWithOverride) => {
    setSelectedGarment(item);
    setIsOverrideDialogOpen(true);
  };

  const columns: ColumnDef<GarmentTypeWithOverride>[] = [
    {
      header: "Garment Name",
      cell: (item: GarmentTypeWithOverride) => (
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-muted border border-border flex items-center justify-center shrink-0">
            <Shirt className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-foreground leading-tight">{item.name}</span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">ID: GT-{item.id.slice(-4).toUpperCase()}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Global Price",
      cell: (item: GarmentTypeWithOverride) => <span className="text-sm font-bold text-foreground">Rs. {(item.customerPrice / 100).toLocaleString()}</span>,
    },
    {
      header: "Branch Price",
      cell: (item: GarmentTypeWithOverride) => (
        <span className={`text-sm font-bold ${item.isOverridden ? 'text-primary' : 'text-muted-foreground'}`}>
          Rs. {(item.resolvedCustomerPrice / 100).toLocaleString()}
        </span>
      ),
    },
    {
      header: "Status",
      cell: (item: GarmentTypeWithOverride) => (
        <Badge variant={item.isOverridden ? "info" : "outline"} className={`uppercase font-bold tracking-widest text-[9px] px-2 py-0.5 ${item.isOverridden ? 'bg-primary/10 text-primary border-primary/20' : 'bg-muted/50 text-muted-foreground'}`}>
          {item.isOverridden ? 'Custom' : 'Standard'}
        </Badge>
      ),
    },
    {
      header: "ACTIONS",
      align: "right",
      cell: (item: GarmentTypeWithOverride) => (
        <div className="flex items-center justify-end gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-muted-foreground hover:text-primary"
            onClick={() => handleEdit(item)}
            title="Edit Price"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
             <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-muted-foreground hover:text-primary"
                onClick={() => {
                  setSelectedGarment(item);
                  setIsHistoryDialogOpen(true);
                }}
                title="View Pricing History"
              >
                <Clock className="h-4 w-4" />
             </Button>
             {item.isOverridden && (
             <Button 
               variant="ghost" 
               size="icon" 
               className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={async () => {
                   try {
                     await configApi.deleteBranchPrice(item.id, branchId);
                     toast({ title: "Success", description: "Prices reset to global standard" });
                     fetchData();
                   } catch {
                     toast({ title: "Error", description: "Failed to reset override", variant: "destructive" });
                   }
                }}
               title="Reset to Global"
             >
               <Trash2 className="h-4 w-4" />
             </Button>
          )}
        </div>
      )
    }
  ];

  if (loading) return <HubSkeleton />;

  return (
    <div className="max-w-9xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
        <Link href="/" className="hover:text-primary">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/settings/branches" className="hover:text-primary">Branches</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">{branch?.name || 'Lahore Hub'} Configuration</span>
      </nav>

      {/* Main Header + Profile */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-4 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-4xl font-extrabold tracking-tight text-foreground">{branch?.name || 'Branch Configuration'}</h1>
              <Badge variant={branch?.isActive ? "success" : "outline"} className="uppercase font-bold tracking-widest text-[10px] px-3 py-1">
                {branch?.isActive ? 'Active' : 'Inactive'}
              </Badge>
              <span className="bg-muted text-muted-foreground font-bold text-[10px] uppercase tracking-widest px-2 py-1 rounded ring-1 ring-border">
                {branch?.code}
              </span>
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
          
          <div className="flex flex-col items-end gap-3 text-right">
             <div className="flex items-center gap-2">
               <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
               <span className="text-[10px] font-bold text-success uppercase tracking-widest">Pricing Online</span>
             </div>
             <p className="text-[11px] text-muted-foreground font-medium max-w-[200px]">
               Changes are saved immediately and synced across all terminals.
             </p>
          </div>
        </div>

        {/* Branch Relations Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-6 bg-card border border-border rounded-xl shadow-sm">
            <div className="flex items-center gap-4 border-b sm:border-b-0 sm:border-r border-border pb-4 sm:pb-0 pr-6">
              <div className="h-12 w-12 rounded-2xl bg-chart-1/10 flex items-center justify-center shrink-0 border border-chart-1/20 group-hover:scale-110 transition-transform">
                <Users className="h-6 w-6 text-chart-1" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Employees</span>
                <span className="text-2xl font-black text-foreground">{branch?._count?.employees || 0}</span>
              </div>
            </div>
           <div className="flex items-center gap-4 border-b sm:border-b-0 lg:border-r border-border pb-4 sm:pb-0 pr-4 sm:pl-4">
              <div className="h-10 w-10 rounded-lg bg-chart-2/10 flex items-center justify-center shrink-0">
                <Users className="h-5 w-5 text-chart-2" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Customers</span>
                <span className="text-xl font-extrabold text-foreground">{branch?._count?.customers || 0}</span>
              </div>
           </div>
           <div className="flex items-center gap-4 border-b sm:border-b-0 sm:border-r border-border pb-4 sm:pb-0 pr-4 sm:pl-4 lg:pl-4">
              <div className="h-10 w-10 rounded-lg bg-chart-3/10 flex items-center justify-center shrink-0">
                <Briefcase className="h-5 w-5 text-chart-3" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Orders</span>
                <span className="text-xl font-extrabold text-foreground">{branch?._count?.orders || 0}</span>
              </div>
           </div>
            <div className="flex items-center gap-4 pt-4 sm:pt-0 pl-0 sm:pl-6">
              <div className="h-12 w-12 rounded-2xl bg-chart-4/10 flex items-center justify-center shrink-0 border border-chart-4/20 group-hover:scale-110 transition-transform">
                <History className="h-6 w-6 text-chart-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Price Overrides</span>
                <span className="text-2xl font-black text-foreground">{branch?._count?.priceOverrides || 0}</span>
              </div>
            </div>
        </div>
      </div>

      {/* Overrides Table Section */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden border-b-4 border-b-border/50">
        <div className="px-8 py-8 border-b border-border/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col gap-1">
             <div className="flex items-center gap-3">
               <h2 className="font-bold text-lg text-foreground">Garment Price Management</h2>
               <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground bg-muted px-2 py-0.5 rounded-md ring-1 ring-border">
                  {totalCount} items
               </span>
             </div>
             <p className="text-[11px] text-muted-foreground">
                Manage branch-specific overrides or <Link href="/settings/garments" className="text-primary hover:underline font-bold">Edit Global Prices ✨</Link>
             </p>
          </div>
          
          <div className="flex items-center gap-4 bg-muted p-1 rounded-lg w-full md:w-auto">
             <div className="relative flex-1 md:w-80">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  variant="premium"
                  className="bg-transparent border-none shadow-none focus-visible:ring-0 pl-10 h-10 text-sm font-bold placeholder:text-muted-foreground text-foreground" 
                  placeholder="Filter garments..." 
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                />
             </div>
          </div>
        </div>

        <div className="p-6">
          <DataTable 
            columns={columns} 
            data={garmentTypes} 
            loading={loading} 
            itemLabel="garments"
            page={currentPage}
            total={totalCount}
            limit={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      <GarmentTypeDialog 
        open={isOverrideDialogOpen}
        onOpenChange={setIsOverrideDialogOpen}
        branchId={branchId}
        branchName={branch?.name || ''}
        initialData={selectedGarment}
        onSuccess={fetchData}
      />

      <BranchPriceHistoryDialog 
        open={isHistoryDialogOpen}
        onOpenChange={setIsHistoryDialogOpen}
        garmentId={selectedGarment?.id || ''}
        garmentName={selectedGarment?.name || ''}
        branchId={branchId}
        branchName={branch?.name || ''}
      />
    </div>
  );
}


function HubSkeleton() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-pulse text-center py-20">
      <Skeleton className="h-4 w-64 mx-auto mb-4" />
      <Skeleton className="h-12 w-96 mx-auto mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-40 rounded-xl" />)}
      </div>
      <Skeleton className="h-[400px] rounded-xl mt-8" />
    </div>
  );
}
