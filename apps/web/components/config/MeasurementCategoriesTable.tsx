"use client";

import React, { useEffect, useState } from "react";
import { Plus, Trash2, Edit2, Eye, Search } from "lucide-react";
import { DataTable, ColumnDef } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { configApi } from "@/lib/api/config";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";
import { MeasurementCategoryDialog } from "./MeasurementCategoryDialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { MEASUREMENT_STATUS_LABELS, MEASUREMENT_STATUS_BADGE } from "@tbms/shared-constants";
import { MeasurementCategory } from "@tbms/shared-types";

export function MeasurementCategoriesTable() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<MeasurementCategory[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [page, setPage] = useState(1);
  const limit = 10;

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<MeasurementCategory | null>(null);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<MeasurementCategory | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await configApi.getMeasurementCategories({
        search: debouncedSearch,
        page,
        limit
      });
      if (response.success) {
        setData(response.data.data);
        setTotal(response.data.total);
      }
    } catch (error) {
      console.error("Failed to fetch measurement categories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, page]);

  const handleEditCategory = (category: MeasurementCategory) => {
    setSelectedCategory(category);
    setIsDialogOpen(true);
  };

  const handleAddCategory = () => {
    setSelectedCategory(null);
    setIsDialogOpen(true);
  };

  const handleDeleteCategory = (category: MeasurementCategory) => {
    setCategoryToDelete(category);
    setIsConfirmOpen(true);
  };

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;
    try {
      await configApi.deleteMeasurementCategory(categoryToDelete.id);
      toast({ title: "Category deleted" });
      fetchData();
    } catch {
      toast({ title: "Error", description: "Failed to delete category", variant: "destructive" });
    }
  };

  const navigateToDetail = (id: string) => {
    router.push(`/settings/measurements/${id}`);
  };

  const columns: ColumnDef<MeasurementCategory>[] = [
    {
      header: "Category Name",
      cell: (cat) => (
        <button 
          onClick={() => navigateToDetail(cat.id)}
          className="font-semibold text-foreground hover:text-primary transition-colors"
        >
          {cat.name}
        </button>
      ),
    },
    {
      header: "Fields",
      cell: (cat: MeasurementCategory) => (
        <Badge variant="info" size="xs">
          {cat.fields?.length || 0} Fields
        </Badge>
      ),
    },
    {
      header: "Status",
      cell: (cat: MeasurementCategory) => (
        <Badge variant={cat.isActive ? MEASUREMENT_STATUS_BADGE.ACTIVE : MEASUREMENT_STATUS_BADGE.HIDDEN} size="xs">
          {cat.isActive ? MEASUREMENT_STATUS_LABELS.ACTIVE : MEASUREMENT_STATUS_LABELS.HIDDEN}
        </Badge>
      ),
    },
    {
      header: "Actions",
      align: "right",
      cell: (cat) => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => navigateToDetail(cat.id)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => handleEditCategory(cat)}>
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteCategory(cat)}>
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
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Measurement Configuration</h1>
          <p className="text-sm text-muted-foreground mt-1">Define and manage measurement fields for your tailoring categories.</p>
        </div>
        <Button variant="premium" size="lg" onClick={handleAddCategory}>
           <Plus className="mr-2 h-5 w-5" /> New Category
        </Button>
      </div>

      {/* Categories Table Card */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
             <h2 className="font-bold text-lg text-foreground">Categories Inventory</h2>
             <Badge variant="secondary" size="xs" className="ring-1 ring-border">
                {total} results
             </Badge>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="relative group flex-1 md:w-64">
                <Input 
                   placeholder="Search categories..." 
                   variant="premium"
                   className="pl-9 h-10"
                   value={search}
                   onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                   }}
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
             </div>
          </div>
        </div>

        <div className="p-6">
          <DataTable
            columns={columns}
            data={data}
            loading={loading}
            emptyMessage="No categories found."
            itemLabel="categories"
            page={page}
            total={total}
            limit={limit}
            onPageChange={setPage}
          />
        </div>
      </div>

      <MeasurementCategoryDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        initialData={selectedCategory} 
        onSuccess={fetchData} 
      />

      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title="Delete Category"
        description={`Are you sure you want to delete the "${categoryToDelete?.name}" category? This action cannot be undone.`}
        onConfirm={confirmDeleteCategory}
        confirmText="Delete Category"
      />
    </div>
  );
}
