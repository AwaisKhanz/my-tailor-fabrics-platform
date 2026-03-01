"use client";

import React, { useEffect, useState } from "react";
import { Plus, Trash2, Edit2, ChevronRight, CheckCircle2 } from "lucide-react";
import { DataTable, ColumnDef } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { configApi } from "@/lib/api/config";
import { MeasurementCategory, MeasurementField } from "@/types/config";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { MeasurementFieldDialog } from "./MeasurementFieldDialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export function MeasurementCategoryDetail({ id }: { id: string }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<MeasurementCategory | null>(null);
  const [isFieldDialogOpen, setIsFieldDialogOpen] = useState(false);
  const [selectedField, setSelectedField] = useState<MeasurementField | null>(null);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [fieldToDelete, setFieldToDelete] = useState<MeasurementField | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await configApi.getMeasurementCategories({ limit: 100 });
      if (response.success) {
        const cat = response.data.data.find((c: MeasurementCategory) => c.id === id);
        if (cat) setCategory(cat);
      }
    } catch (error) {
      console.error("Failed to fetch category details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleAddField = () => {
    setSelectedField(null);
    setIsFieldDialogOpen(true);
  };

  const handleEditField = (field: MeasurementField) => {
    setSelectedField(field);
    setIsFieldDialogOpen(true);
  };

  const handleDeleteField = (field: MeasurementField) => {
    setFieldToDelete(field);
    setIsConfirmOpen(true);
  };

  const confirmDeleteField = async () => {
    if (!fieldToDelete) return;
    try {
      await configApi.deleteMeasurementField(fieldToDelete.id);
      toast({ title: "Field deleted" });
      fetchData();
    } catch {
      toast({ title: "Error", description: "Failed to delete field", variant: "destructive" });
    } finally {
      setIsConfirmOpen(false);
      setFieldToDelete(null);
    }
  };

  const columns: ColumnDef<MeasurementField>[] = [
    {
      header: "Field Label",
      cell: (field) => <span className="font-semibold text-foreground">{field.label}</span>,
    },
    {
      header: "Data Type",
      cell: (field) => (
        <Badge variant="info">
          {field.fieldType === 'NUMBER' ? 'Numeric (Inches)' : field.fieldType}
        </Badge>
      ),
    },
    {
      header: "Status",
      cell: (field) => (
        <div className="flex items-center gap-2">
          {field.isRequired ? (
            <div className="flex items-center gap-1.5 text-success font-medium text-xs uppercase tracking-wider">
               <CheckCircle2 className="h-3.5 w-3.5" /> Required
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-muted-foreground font-medium text-xs uppercase tracking-wider">
               <div className="h-3.5 w-3.5 rounded-full border-2 border-muted" /> Optional
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Actions",
      align: "right",
      cell: (field) => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => handleEditField(field)}>
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteField(field)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
         <Link href="/settings" className="hover:text-primary transition-colors">Settings</Link>
         <ChevronRight className="h-3 w-3" />
         <Link href="/settings/measurements" className="hover:text-primary transition-colors">Measurements</Link>
         <ChevronRight className="h-3 w-3" />
         <span className="text-primary font-bold">{category?.name}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
         <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">{category?.name} Fields</h1>
            <p className="text-sm text-muted-foreground">Manage specific measurement fields for this apparel category.</p>
         </div>
         <Button variant="premium" size="xl" onClick={handleAddField}>
            <Plus className="mr-2 h-5 w-5" /> Add New Field
         </Button>
      </div>

      <DataTable
        columns={columns}
        data={category?.fields || []}
        loading={loading}
        emptyMessage="No fields defined for this category."
        itemLabel="fields"
      />

      <MeasurementFieldDialog 
        open={isFieldDialogOpen} 
        onOpenChange={setIsFieldDialogOpen} 
        categoryId={id}
        categoryName={category?.name}
        initialData={selectedField} 
        existingFields={category?.fields || []}
        onSuccess={fetchData} 
      />

      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title="Delete Field"
        description={`Are you sure you want to delete the field "${fieldToDelete?.label}"? This action cannot be undone.`}
        onConfirm={confirmDeleteField}
        confirmText="Delete Field"
      />
    </div>
  );
}
