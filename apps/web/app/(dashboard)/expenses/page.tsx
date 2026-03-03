"use client";

import { Plus } from "lucide-react";
import { ExpenseCreateDialog } from "@/components/expenses/expense-create-dialog";
import { ExpensesFiltersCard } from "@/components/expenses/expenses-filters-card";
import { ExpensesOverviewCards } from "@/components/expenses/expenses-overview-cards";
import { ExpensesTable } from "@/components/expenses/expenses-table";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PageHeader } from "@/components/ui/page-header";
import { formatPKR } from "@/lib/utils";
import { useExpensesPage } from "@/hooks/use-expenses-page";

export default function ExpensesPage() {
  const {
    loading,
    categoriesLoading,
    expenses,
    total,
    page,
    pageSize,
    categories,
    filters,
    activeFilterCount,
    listedAmount,
    addOpen,
    form,
    saving,
    deleteTarget,
    deletingId,
    setPage,
    setCategoryFilter,
    setFromFilter,
    setToFilter,
    resetFilters,
    updateFormField,
    openAddDialog,
    closeAddDialog,
    submitCreateExpense,
    requestDeleteExpense,
    closeDeleteDialog,
    confirmDeleteExpense,
  } = useExpensesPage();

  return (
    <div className="mx-auto max-w-9xl space-y-6">
      <PageHeader
        title="Business Expenses"
        description="Track and manage business overheads and supplies with consistent filters and secure action flows."
        actions={
          <Button variant="premium" size="lg" onClick={openAddDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Add Expense
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <ExpensesOverviewCards
            listedAmount={listedAmount}
            listedCount={expenses.length}
            totalCount={total}
          />
        </div>

        <div className="lg:col-span-3">
          <ExpensesFiltersCard
            categories={categories}
            categoriesLoading={categoriesLoading}
            filters={filters}
            activeFilterCount={activeFilterCount}
            onCategoryChange={setCategoryFilter}
            onFromChange={setFromFilter}
            onToChange={setToFilter}
            onReset={resetFilters}
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <ExpensesTable
          expenses={expenses}
          loading={loading}
          page={page}
          total={total}
          pageSize={pageSize}
          deletingId={deletingId}
          onPageChange={setPage}
          onDeleteExpense={requestDeleteExpense}
        />
      </div>

      <ExpenseCreateDialog
        open={addOpen}
        saving={saving}
        categoriesLoading={categoriesLoading}
        categories={categories}
        form={form}
        onOpenChange={(open) => {
          if (open) {
            openAddDialog();
          } else {
            closeAddDialog();
          }
        }}
        onFormChange={updateFormField}
        onSubmit={submitCreateExpense}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) {
            closeDeleteDialog();
          }
        }}
        title="Delete this expense?"
        description={
          deleteTarget
            ? `This will permanently remove ${deleteTarget.category.name} (${formatPKR(deleteTarget.amount)}).`
            : "This action cannot be undone."
        }
        onConfirm={confirmDeleteExpense}
        confirmText="Delete Expense"
        variant="destructive"
        loading={Boolean(deleteTarget && deletingId === deleteTarget.id)}
      />
    </div>
  );
}
