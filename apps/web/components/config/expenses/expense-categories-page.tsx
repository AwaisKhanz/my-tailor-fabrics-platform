"use client";

import { useMemo } from "react";
import { Edit2, Plus, RotateCcw, Search, Trash2 } from "lucide-react";
import { type ExpenseCategory } from "@tbms/shared-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { DialogFormActions, FormStack } from "@/components/ui/form-layout";
import { InfoTile } from "@/components/ui/info-tile";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { PageSection, PageShell } from "@/components/ui/page-shell";
import { ScrollableDialog } from "@/components/ui/scrollable-dialog";
import { StatCard } from "@/components/ui/stat-card";
import { Switch } from "@/components/ui/switch";
import {
  TableSearch,
  TableSurface,
  TableToolbar,
} from "@/components/ui/table-layout";
import { useAuthz } from "@/hooks/use-authz";
import { useExpenseCategoriesPage } from "@/hooks/use-expense-categories-page";

export function ExpenseCategoriesPage() {
  const { canAll } = useAuthz();
  const canManageExpenseCategories = canAll(["expenses.manage"]);

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
          <span className="font-semibold text-text-primary">
            {category.name}
          </span>
        ),
      },
      {
        header: "Status",
        cell: (category) => (
          <Badge variant={category.isActive ? "success" : "outline"} size="xs">
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
                  variant="tableIcon"
                  size="iconSm"
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
                  variant="tableDanger"
                  size="iconSm"
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
              <span className="text-xs font-medium text-text-secondary">
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
          density="compact"
          actions={
            canManageExpenseCategories ? (
              <Button
                type="button"
                variant="premium"
                size="lg"
                onClick={openCreateDialog}
                className="w-full sm:w-auto"
              >
                <Plus className="h-4 w-4" />
                Add Category
              </Button>
            ) : null
          }
        />
      </PageSection>

      <PageSection
        spacing="compact"
        className="grid space-y-0 gap-4 md:grid-cols-3"
      >
        <StatCard
          title="Total Categories"
          subtitle="configured"
          value={stats.total.toLocaleString()}
          tone="primary"
        />
        <StatCard
          title="Active"
          subtitle="usable in expenses"
          value={stats.active.toLocaleString()}
          tone="success"
        />
        <StatCard
          title="Inactive"
          subtitle="disabled for new records"
          value={stats.inactive.toLocaleString()}
          tone="warning"
        />
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
                  icon={<Search className="h-4 w-4" />}
                  placeholder="Search category..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
                <Button
                  type="button"
                  variant="tableReset"
                  size="sm"
                  className="md:ml-auto"
                  onClick={resetFilters}
                  disabled={!hasActiveFilters}
                >
                  <RotateCcw className="mr-2 h-3.5 w-3.5" />
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
          <ScrollableDialog
            open={dialogOpen}
            onOpenChange={closeDialog}
            title={
              editingCategory
                ? "Edit Expense Category"
                : "Create Expense Category"
            }
            footerActions={
              <DialogFormActions
                onCancel={() => closeDialog(false)}
                submitFormId="expense-category-form"
                submitting={saving}
                submitText={
                  editingCategory ? "Save Changes" : "Create Category"
                }
                submitVariant="premium"
              />
            }
          >
            <FormStack
              as="form"
              id="expense-category-form"
              onSubmit={(event) => {
                event.preventDefault();
                void saveCategory();
              }}
            >
              <div className="space-y-4">
                {formError ? (
                  <p className="text-sm text-destructive">{formError}</p>
                ) : null}
                <div className="space-y-2">
                  <Label htmlFor="expense-category-name" variant="dashboard">
                    Name
                  </Label>
                  <Input
                    id="expense-category-name"
                    variant="table"
                    value={form.name}
                    onChange={(event) =>
                      updateFormField("name", event.target.value)
                    }
                    placeholder="e.g. Utilities"
                    disabled={saving}
                  />
                  {fieldErrors.name ? (
                    <p className="text-xs text-destructive">
                      {fieldErrors.name}
                    </p>
                  ) : null}
                </div>

                <InfoTile layout="betweenGap" className="rounded-md">
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      Active
                    </p>
                    <p className="text-xs text-text-secondary">
                      Active categories are available in expense entry forms.
                    </p>
                  </div>
                  <Switch
                    variant="premium"
                    checked={form.isActive}
                    onCheckedChange={(checked) =>
                      updateFormField("isActive", checked)
                    }
                    disabled={saving}
                  />
                </InfoTile>
              </div>
            </FormStack>
          </ScrollableDialog>

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
