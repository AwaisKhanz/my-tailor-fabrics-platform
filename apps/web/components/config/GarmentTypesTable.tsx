"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Edit2, Shirt, Trash2, Filter, Clock } from "lucide-react";
import { DataTable, ColumnDef } from "@/components/ui/data-table";
import { configApi } from "@/lib/api/config";
import { GarmentType } from "@/types/config";
import { WorkflowStepTemplate } from "@tbms/shared-types";

import { GarmentTypeDialog } from "./GarmentTypeDialog";
import { GarmentPriceHistoryDialog } from "./GarmentPriceHistoryDialog";
import { GarmentWorkflowStepsDialog } from "./GarmentWorkflowStepsDialog";
import { useToast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/use-debounce";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { GARMENT_STATUS_LABELS } from "@tbms/shared-constants";
import { formatPKR } from "@/lib/utils";
import Link from "next/link";

export function GarmentTypesTable() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<GarmentType[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isWorkflowOpen, setIsWorkflowOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<GarmentType | null>(null);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [typeToDelete, setTypeToDelete] = useState<GarmentType | null>(null);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;


  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await configApi.getGarmentTypes({
        search: debouncedSearch,
        page: currentPage,
        limit: itemsPerPage,
      });
      if (response.success) {
        setData(response.data.data);
        setTotalCount(response.data.total);
      }
    } catch (error) {
      console.error("Failed to fetch garment types:", error);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, currentPage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEdit = (type: GarmentType) => {
    setSelectedType(type);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedType(null);
    setIsDialogOpen(true);
  };

  const handleDelete = (type: GarmentType) => {
    setTypeToDelete(type);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!typeToDelete) return;
    try {
        await configApi.deleteGarmentType(typeToDelete.id);
        toast({ title: "Success", description: "Garment type deleted" });
        fetchData();
    } catch {
        toast({ title: "Error", description: "Failed to delete garment type", variant: "destructive" });
    }
  };



  const columns: ColumnDef<GarmentType>[] = [
    {
      header: "Garment Name",
      cell: (item) => (
        <div className="flex items-center gap-4 group/row">
          <div className="h-10 w-10 rounded-lg bg-muted border border-border flex items-center justify-center shrink-0 group-hover/row:bg-primary/5 group-hover/row:border-primary/20 transition-colors">
            <Shirt className="h-5 w-5 text-muted-foreground group-hover/row:text-primary transition-colors" />
          </div>
          <Link href={`/settings/garments/${item.id}`} className="flex flex-col group/link hover:opacity-80 transition-opacity">
            <span className="text-sm font-bold text-foreground leading-tight group-hover/link:text-primary transition-colors">{item.name}</span>
            <Label variant="dashboard" className="mt-0.5">ID: GT-{item.id.slice(-4).toUpperCase()}</Label>
          </Link>
        </div>
      ),
    },
    {
      header: "Customer Price",
      cell: (item) => (
        <span className="text-sm font-bold text-foreground">
          {formatPKR(item.customerPrice)}
        </span>
      ),
    },
    {
      header: "Employee Rate",
      cell: (item: GarmentType) => <span className="text-sm font-bold text-foreground">{formatPKR(item.employeeRate)}</span>,
    },
    {
      header: "Status",
      cell: (item: GarmentType) => (
        <Badge variant={item.isActive ? "success" : "outline"} size="xs">
          {item.isActive ? GARMENT_STATUS_LABELS.ACTIVE : GARMENT_STATUS_LABELS.INACTIVE}
        </Badge>
      ),
    },
    {
      header: "Actions",
      align: "right",
      cell: (item: GarmentType) => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10" onClick={() => handleEdit(item)}>
            <Edit2 className="h-4 w-4" />
          </Button>

          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/5"
            onClick={() => {
              setSelectedType(item);
              setIsHistoryOpen(true);
            }}
          >
            <Clock className="h-4 w-4" />
          </Button>

          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/5"
            onClick={() => {
              setSelectedType(item);
              setIsWorkflowOpen(true);
            }}
            title="Configure Production Workflow"
          >
            <Shirt className="h-4 w-4" />
          </Button>
          
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(item)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Garment Management</h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">Configure garment types, inventory pricing models, and production rates.</p>
        </div>
        <Button variant="premium" size="lg" onClick={handleAdd}>
          <Plus className="mr-2 h-5 w-5" /> Add New Garment Type
        </Button>
      </div>

      {/* Garment Type Inventory Table */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
             <h2 className="font-bold text-lg text-foreground">Garment Type Inventory</h2>
             <Badge variant="secondary" size="xs" className="ring-1 ring-border">
                {totalCount} results
             </Badge>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="relative group flex-1 md:w-64">
                <Input 
                   placeholder="Search garments..." 
                   variant="premium"
                   className="pl-9"
                   value={search}
                   onChange={(e) => {
                      setSearch(e.target.value);
                      setCurrentPage(1);
                   }}
                />
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
             </div>
          
          </div>
        </div>

        <div className="p-6">
          <DataTable
            columns={columns}
            data={data}
            loading={loading}
            emptyMessage="No garment types found."
            itemLabel="types"
            page={currentPage}
            total={totalCount}
            limit={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

    

      <GarmentTypeDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        initialData={selectedType}
        onSuccess={fetchData}
      />

      <GarmentPriceHistoryDialog
        open={isHistoryOpen}
        onOpenChange={setIsHistoryOpen}
        garmentId={selectedType?.id || ""}
        garmentName={selectedType?.name || ""}
      />

      <GarmentWorkflowStepsDialog
        open={isWorkflowOpen}
        onOpenChange={setIsWorkflowOpen}
        garmentId={selectedType?.id || ""}
        garmentName={selectedType?.name || ""}
        initialSteps={(selectedType as GarmentType & { workflowSteps?: WorkflowStepTemplate[] })?.workflowSteps || []}
        onSuccess={fetchData}
      />

      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title="Delete Garment Type"
        description={`Are you sure you want to delete "${selectedType?.name}"? This action cannot be undone.`}
        onConfirm={confirmDelete}
        confirmText="Delete Garment Type"
      />
    </div>
  );
}
