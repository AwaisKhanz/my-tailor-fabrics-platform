"use client";

import React, { useEffect, useState, useCallback } from "react";
import { 
  Plus, 
  GitBranch,
  ArrowLeft,
  Layout,
  Edit2,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, ColumnDef } from "@/components/ui/data-table";
import { designTypesApi } from "@/lib/api/design-types";
import { configApi } from "@/lib/api/config";
import { branchesApi } from "@/lib/api/branches";
import { CreateDesignTypeDialog } from "@/components/design-types/CreateDesignTypeDialog";
import { 
  type DesignType, 
  type GarmentType, 
  type Branch 
} from "@tbms/shared-types";
import { useRouter } from "next/navigation";
import { formatPKR } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function DesignTypesPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [designTypes, setDesignTypes] = useState<DesignType[]>([]);
  const [garmentTypes, setGarmentTypes] = useState<GarmentType[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedDesign, setSelectedDesign] = useState<DesignType | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [dsResp, garmentsResp, branchesResp] = await Promise.all([
        designTypesApi.findAll(),
        configApi.getGarmentTypes({ limit: 100 }),
        branchesApi.getBranches()
      ]);

      console.log(dsResp);
      if (dsResp.success) {
        console.log(dsResp.data);
        setDesignTypes(dsResp.data);
      }
      
      if (garmentsResp.success && garmentsResp.data) {
        setGarmentTypes(garmentsResp.data.data);
      }
      
      if (branchesResp.success && branchesResp.data) {
        setBranches(branchesResp.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch design types data:", err);
      toast({ title: "Error", description: "Failed to load design types", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (data: Partial<DesignType>) => {
    try {
      if (selectedDesign) {
        await designTypesApi.update(selectedDesign.id, data);
        toast({ title: "Updated", description: "Design type updated successfully" });
      } else {
        await designTypesApi.create(data);
        toast({ title: "Created", description: "Design type created successfully" });
      }
      fetchData();
    } catch {
      toast({ title: "Error", description: "Save failed", variant: "destructive" });
    }
  };

  const handleRemove = async (id: string) => {
    if (!confirm("Remove this design type?")) return;
    try {
      await designTypesApi.remove(id);
      toast({ title: "Removed", description: "Design type removed" });
      fetchData();
    } catch {
      toast({ title: "Error", description: "Remove failed", variant: "destructive" });
    }
  };

  const filteredData = designTypes;

  const columns: ColumnDef<DesignType>[] = [
    {
      header: "Name",
      cell: (dt) => (
        <div className="font-bold text-foreground">
          {dt.name}
        </div>
      )
    },
    {
      header: "Application",
      cell: (dt) => (
        <div className="flex flex-col gap-1">
          {dt.garmentTypeId ? (
            <span className="text-xs font-medium">
              {(garmentTypes.find(gt => gt.id === dt.garmentTypeId))?.name || "Garment"}
            </span>
          ) : (
              <div>
            <Badge variant="default" className="" size="xs">Universal</Badge></div>
          )}
        </div>
      )
    },
    {
      header: "Branch",
      cell: (dt) => (
        <>
          {dt.branchId ? (
            <Badge variant="outline" size="xs" className="gap-1">
              <GitBranch className="h-2.5 w-2.5" />
              {(branches.find(b => b.id === dt.branchId))?.code || 'Branch'}
            </Badge>
          ) : (
            <Badge variant="info" size="xs">Global</Badge>
          )}
        </>
      )
    },
    {
      header: "Customer Price",
      align: "right",
      cell: (dt) => (
        <span className="font-bold">
          {formatPKR(dt.defaultPrice)}
        </span>
      )
    },
    {
      header: "Worker Rate",
      align: "right",
      cell: (dt) => (
        <span className="font-bold text-ready">
          {formatPKR(dt.defaultRate)}
        </span>
      )
    },
    {
      header: "Actions",
      align: "right",
      cell: (dt) => (
        <div className="flex justify-end gap-2">
           <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8" 
            onClick={() => {
              setSelectedDesign(dt);
              setShowCreate(true);
            }}
           >
             <Edit2 className="h-4 w-4" />
           </Button>
           <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-destructive" 
            onClick={() => handleRemove(dt.id)}
           >
             <Trash2 className="h-4 w-4" />
           </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
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
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Design Types</h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-1 flex items-center gap-2">
              <Layout className="h-3.5 w-3.5" />
              Standardize pricing for different design complexities
            </p>
          </div>
        </div>
        <Button 
          variant="premium" 
          className="gap-2"
          onClick={() => {
            setSelectedDesign(null);
            setShowCreate(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Add Design Type
        </Button>
      </div>

 

      <DataTable<DesignType> 
        columns={columns} 
        data={filteredData}
        loading={loading}
        itemLabel="design types"
      />

      <CreateDesignTypeDialog 
        open={showCreate}
        onOpenChange={setShowCreate}
        onSubmit={handleSubmit}
        initialData={selectedDesign}
        garmentTypes={garmentTypes.map(gt => ({ id: gt.id, name: gt.name }))}
        branches={branches.map(b => ({ id: b.id, name: b.name, code: b.code }))}
      />
    </div>
  );
}
