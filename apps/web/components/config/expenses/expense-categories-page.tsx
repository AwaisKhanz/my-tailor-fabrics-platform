"use client";

import { useMemo } from "react";
import { Edit2, Plus, RotateCcw, Trash2 } from "lucide-react";
import { type ExpenseCategory } from "@tbms/shared-types";
import { Badge } from "@tbms/ui/components/badge";
import { Button } from "@tbms/ui/components/button";
import { ConfirmDialog } from "@tbms/ui/components/confirm-dialog";
import { DataTable, type ColumnDef } from "@tbms/ui/components/data-table";
import { PageHeader } from "@tbms/ui/components/page-header";
import { PageSection, PageShell } from "@tbms/ui/components/page-shell";
import { StatCard } from "@tbms/ui/components/stat-card";
import { StatsGrid } from "@tbms/ui/components/stats-grid";
import {
  TableSearch,
  TableSurface,
  TableToolbar,
} from "@tbms/ui/components/table-layout";
import { useAuthz } from "@/hooks/use-authz";
import { useExpenseCategoriesPage } from "@/hooks/use-expense-categories-page";
import { PERMISSION } from "@tbms/shared-constants";
import { ExpenseCategoryDialog } from "@/components/config/expenses/expense-category-dialog";

export function ExpenseCategoriesPage() {
  const { canAll } = useAuthz();
  const canManageExpenseCategories = canAll([PERMISSION["expenses.manage"]]);

  const {
    loading,
    saving,
    deletingId,
    categories,
    total,
    page,
    pageSize,
    stats,
    search,
    hasActiveFilters,
    dialogOpen,
    editingCategory,
    form,
    formError,
    fieldErrors,
    deleteTarget,
    setSearch,
    setPage,
    resetFilters,
    openCreateDialog,
    openEditDialog,
    closeDialog,
    updateFormField,
    saveCategory,
    toggleCategoryStatus,
    requestDeleteCategory,
    closeDeleteDialog,
    confirmDeleteCategory,
  } = useExpenseCategoriesPage();

  const columns = useMemo<ColumnDef<ExpenseCategory>[]>(
    () => [
      {
        header: "Category Name",
        cell: (category) => (
          <span className="font-semibold text-foreground">{category.name}</span>
        ),
      },
      {
        header: "Status",
        cell: (category) => (
          <Badge variant={category.isActive ? "default" : "outline"}>
            {category.isActive ? "Active" : "Inactive"}
          </Badge>
        ),
      },
      {
        header: "Actions",
        align: "right",
        cell: (category) => (
          <div className="flex justify-end gap-2">
            {canManageExpenseCategories ? (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={(event) => {
                    event.stopPropagation();
                    openEditDialog(category);
                  }}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={(event) => {
                    event.stopPropagation();
                    void toggleCategoryStatus(category);
                  }}
                >
                  {category.isActive ? "Disable" : "Enable"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  disabled={deletingId === category.id}
                  onClick={(event) => {
                    event.stopPropagation();
                    requestDeleteCategory(category);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <span className="text-xs font-medium text-muted-foreground">
                Read only
              </span>
            )}
          </div>
        ),
      },
    ],
    [
      canManageExpenseCategories,
      deletingId,
      openEditDialog,
      requestDeleteCategory,
      toggleCategoryStatus,
    ],
  );

  return (
    <PageShell>
      <PageSection spacing="compact">
        <PageHeader
          title="Expense Categories"
          description="Manage reusable spending categories for branch expense logging."
          actions={
            canManageExpenseCategories ? (
              <Button type="button" variant="default" onClick={openCreateDialog}>
                <Plus className="h-4 w-4" />
                Add Category
              </Button>
            ) : null
          }
        />
      </PageSection>

      <PageSection spacing="compact">
        <StatsGrid columns="threeMd">
          <StatCard
            title="Total Categories"
            subtitle="Directory size"
            value={stats.total.toLocaleString()}
            helperText="Configured expense groups"
          />
          <StatCard
            title="Active"
            subtitle="Ready to use"
            value={stats.active.toLocaleString()}
            helperText="Available in expense entries"
            tone="success"
          />
          <StatCard
            title="Inactive"
            subtitle="Disabled entries"
            value={stats.inactive.toLocaleString()}
            helperText="Hidden from new expense records"
            tone="warning"
          />
        </StatsGrid>
      </PageSection>

      <PageSection spacing="compact">
        <TableSurface>
          <TableToolbar
            title="Category Directory"
            total={total}
            totalLabel="categories"
            activeFilterCount={hasActiveFilters ? 1 : 0}
            controls={
              <>
                <TableSearch
                  placeholder="Search category..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetFilters}
                  disabled={!hasActiveFilters}
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </Button>
              </>
            }
          />

          <DataTable
            columns={columns}
            data={categories}
            loading={loading}
            itemLabel="categories"
            emptyMessage="No expense categories found."
            chrome="flat"
            page={page}
            total={total}
            limit={pageSize}
            onPageChange={setPage}
            onRowClick={canManageExpenseCategories ? openEditDialog : undefined}
          />
        </TableSurface>
      </PageSection>

      {canManageExpenseCategories ? (
        <>
          <ExpenseCategoryDialog
            open={dialogOpen}
            onOpenChange={closeDialog}
            editingCategory={editingCategory}
            saving={saving}
            form={form}
            formError={formError}
            fieldErrors={fieldErrors}
            onUpdateField={updateFormField}
            onSubmit={saveCategory}
          />

          <ConfirmDialog
            open={Boolean(deleteTarget)}
            onOpenChange={closeDeleteDialog}
            title="Delete this category?"
            description={
              deleteTarget
                ? `This will remove "${deleteTarget.name}" from selectable expense categories.`
                : "This action cannot be undone."
            }
            onConfirm={() => {
              void confirmDeleteCategory();
            }}
            confirmText="Delete Category"
            variant="destructive"
            loading={Boolean(deleteTarget && deletingId === deleteTarget.id)}
          />
        </>
      ) : null}
    </PageShell>
  );
}
