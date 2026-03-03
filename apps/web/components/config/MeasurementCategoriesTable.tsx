"use client";

import { useRouter } from "next/navigation";
import { MeasurementCategoryDialog } from "@/components/config/MeasurementCategoryDialog";
import { MeasurementCategoriesInventoryTable } from "@/components/config/measurements/list/measurement-categories-inventory-table";
import { MeasurementCategoriesListToolbar } from "@/components/config/measurements/list/measurement-categories-list-toolbar";
import { MeasurementCategoriesPageHeader } from "@/components/config/measurements/list/measurement-categories-page-header";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useMeasurementCategoriesPage } from "@/hooks/use-measurement-categories-page";

export function MeasurementCategoriesTable() {
  const router = useRouter();

  const {
    loading,
    categories,
    total,
    search,
    page,
    pageSize,
    hasActiveFilters,
    isDialogOpen,
    selectedCategory,
    isConfirmOpen,
    categoryToDelete,
    setPage,
    setSearchFilter,
    resetFilters,
    openCreateDialog,
    openEditDialog,
    closeDialog,
    requestDelete,
    closeConfirm,
    confirmDelete,
    fetchCategories,
  } = useMeasurementCategoriesPage();

  return (
    <div className="space-y-6">
      <MeasurementCategoriesPageHeader onAdd={openCreateDialog} />

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <MeasurementCategoriesListToolbar
          total={total}
          search={search}
          hasActiveFilters={hasActiveFilters}
          onSearchChange={setSearchFilter}
          onReset={resetFilters}
        />

        <div className="p-6">
          <MeasurementCategoriesInventoryTable
            categories={categories}
            loading={loading}
            page={page}
            total={total}
            pageSize={pageSize}
            onPageChange={setPage}
            onView={(category) => {
              router.push(`/settings/measurements/${category.id}`);
            }}
            onEdit={openEditDialog}
            onDelete={requestDelete}
          />
        </div>
      </div>

      <MeasurementCategoryDialog
        open={isDialogOpen}
        onOpenChange={closeDialog}
        initialData={selectedCategory}
        onSuccess={() => {
          void fetchCategories();
        }}
      />

      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={closeConfirm}
        title="Delete Category"
        description={`Are you sure you want to delete the "${categoryToDelete?.name}" category? This action cannot be undone.`}
        onConfirm={() => {
          void confirmDelete();
        }}
        confirmText="Delete Category"
      />
    </div>
  );
}
