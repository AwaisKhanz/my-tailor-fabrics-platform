"use client";

import React, { useEffect, useState, useCallback } from "react";
import { 
  Plus, 
  Search, 
  TrendingUp,
  GitBranch,
  ArrowLeft,
  IndianRupee as IndianRupeeIcon, 
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DataTable, ColumnDef } from "@/components/ui/data-table";
import { ratesApi } from "@/lib/api/rates";
import { configApi } from "@/lib/api/config";
import { branchesApi } from "@/lib/api/branches";
import { CreateRateDialog } from "@/components/rates/CreateRateDialog";
import { 
  type RateCard, 
  type GarmentType, 
  type Branch, 
  type CreateRateCardInput 
} from "@tbms/shared-types";
import { STEP_KEYS, paisaToRupees } from "@tbms/shared-constants";
import { useRouter } from "next/navigation";

export default function RatesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [rates, setRates] = useState<RateCard[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [garmentTypes, setGarmentTypes] = useState<GarmentType[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [showCreateRate, setShowCreateRate] = useState(false);
  const [search, setSearch] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [ratesResp, garmentsResp, branchesResp] = await Promise.all([
        ratesApi.findAll({ search, page, limit }),
        configApi.getGarmentTypes({ limit: 100 }),
        branchesApi.getBranches()
      ]);

      if (ratesResp.success) {
        setRates(ratesResp.data.data);
        setTotal(ratesResp.data.total);
      }
      
      if (garmentsResp.success && garmentsResp.data) {
        setGarmentTypes(garmentsResp.data.data);
      }
      
      if (branchesResp.success && branchesResp.data) {
        setBranches(branchesResp.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch rates data:", err);
    } finally {
      setLoading(false);
    }
  }, [search, page, limit]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchData]);

  const handleCreateRate = async (data: CreateRateCardInput) => {
    const resp = await ratesApi.create(data);
    if (resp.success) {
      fetchData();
    }
  };

  type RateWithIncludes = RateCard & { 
    garmentType?: { name: string }; 
    branch?: { code: string; name: string } | null 
  };

  const columns: ColumnDef<RateWithIncludes>[] = [
    {
      header: "Garment Type",
      cell: (rate) => (
        <div className="font-medium text-foreground">
          {rate.garmentType?.name || "Unknown"}
        </div>
      )
    },
    {
      header: "Step",
      accessorKey: "stepKey",
      className: "font-bold"
    },
    {
      header: "Branch",
      cell: (rate) => (
        <>
          {rate.branchId ? (
            <Badge variant="outline" className="text-[10px] font-bold gap-1">
              <GitBranch className="h-2.5 w-2.5" />
              {rate.branch?.code || 'Branch'}
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-[10px] font-bold">Global</Badge>
          )}
        </>
      )
    },
    {
      header: "Rate",
      align: "right",
      cell: (rate) => (
        <span className="font-black text-ready">
          Rs. {paisaToRupees(rate.amount)}
        </span>
      )
    },
    {
      header: "Effective",
      align: "right",
      cell: (rate) => (
        <div className="flex flex-col items-end text-[10px] text-muted-foreground whitespace-nowrap">
          <span className="flex items-center gap-1 font-medium text-foreground">
            <Clock className="h-2.5 w-2.5" />
            {new Date(rate.effectiveFrom).toLocaleDateString()}
          </span>
          {rate.effectiveTo && (
            <span>until {new Date(rate.effectiveTo).toLocaleDateString()}</span>
          )}
        </div>
      )
    }
  ];

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
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Production Rates</h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-1 flex items-center gap-2">
              <IndianRupeeIcon className="h-3.5 w-3.5" />
              Manage step-based labor costs & effective dates
            </p>
          </div>
        </div>
        <Button 
          className="gap-2 font-bold uppercase tracking-wider text-[10px]"
          onClick={() => setShowCreateRate(true)}
        >
          <Plus className="h-4 w-4" />
          Define New Rate
        </Button>
      </div>

      {/* Search & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by step key or garment type..." 
              className="pl-9 bg-card border-border/50"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>
        <Card className="bg-primary/[0.02] border-primary/10">
          <CardContent className="p-4 flex items-center justify-between">
             <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Total Defined</p>
                <p className="text-xl font-black">{total}</p>
             </div>
             <TrendingUp className="h-5 w-5 text-primary opacity-50" />
          </CardContent>
        </Card>
      </div>

      {/* DataTable */}
      <DataTable<RateWithIncludes> 
        columns={columns} 
        data={rates as RateWithIncludes[]}
        loading={loading}
        page={page}
        total={total}
        limit={limit}
        onPageChange={setPage}
        itemLabel="rate cards"
      />

      <CreateRateDialog 
        open={showCreateRate}
        onOpenChange={setShowCreateRate}
        onSubmit={handleCreateRate}
        garmentTypes={garmentTypes.map(gt => ({ id: gt.id, name: gt.name }))}
        branches={branches.map(b => ({ id: b.id, name: b.name, code: b.code }))}
        steps={Object.values(STEP_KEYS)}
      />
    </div>
  );
}
