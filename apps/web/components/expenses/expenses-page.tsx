"use client";

import { Plus } from "lucide-react";
import { ExpenseCreateDialog } from "@/components/expenses/expense-create-dialog";
import { ExpensesFiltersCard } from "@/components/expenses/expenses-filters-card";
import { ExpensesOverviewCards } from "@/components/expenses/expenses-overview-cards";
import { ExpensesTable } from "@/components/expenses/expenses-table";
import { ActionStrip } from "@tbms/ui/components/action-strip";
import { Button } from "@tbms/ui/components/button";
import { ConfirmDialog } from "@tbms/ui/components/confirm-dialog";
import { PageHeader } from "@tbms/ui/components/page-header";
import { PageSection, PageShell } from "@tbms/ui/components/page-shell";
import { TableSurface } from "@tbms/ui/components/table-layout";
import { useAuthz } from "@/hooks/use-authz";
import { useExpensesPage } from "@/hooks/use-expenses-page";
import { formatPKR } from "@/lib/utils";
import { PERMISSION } from "@tbms/shared-constants";

export function ExpensesPage() {
  const { canAll } = useAuthz();
  const canManageExpenses = canAll([PERMISSION["expenses.manage"]]);
  const {
    loading,
    categoriesLoading,
    expenses,
    total,
    page,
    pageSize,
    categories,
    categoryFilterOptions,
    filters,
    activeFilterCount,
    listedAmount,
    addOpen,
    form,
    formError,
    fieldErrors,
    saving,
    deleteTarget,
    deletingId,
    setPage,
    setSearchFilter,
    setCategoryFilter,
    setFromFilter,
    setToFilter,
    resetFilters,
    updateFormField,
    openAddDialog,
    handleAddDialogChange,
    submitCreateExpense,
    requestDeleteExpense,
    handleDeleteDialogChange,
    confirmDeleteExpense,
  } = useExpensesPage();

  return (
    <PageShell>
      <PageSection spacing="compact">
        <PageHeader
          title="Business Expenses"
          description={
            total > 0
              ? `Track spending with ${total} recorded expenses. Current page amount: ${formatPKR(listedAmount)}.`
              : "Track and manage business overheads and supplies with consistent filters and secure action flows."
          }
          actions={
            canManageExpenses ? (
              <ActionStrip>
                <Button variant="default" onClick={openAddDialog}>
                  <Plus className="h-4 w-4" />
                  Add Expense
                </Button>
              </ActionStrip>
            ) : null
          }
          surface="card"
          density="compact"
        />
      </PageSection>

      <PageSection spacing="compact">
        <ExpensesOverviewCards
          listedAmount={listedAmount}
          listedCount={expenses.length}
          totalCount={total}
          activeFilterCount={activeFilterCount}
        />
      </PageSection>

      <PageSection spacing="compact">
        <TableSurface>
          <ExpensesFiltersCard
            total={total}
            categoryFilterOptions={categoryFilterOptions}
            categoriesLoading={categoriesLoading}
            filters={filters}
            activeFilterCount={activeFilterCount}
            onSearchChange={setSearchFilter}
            onCategoryChange={setCategoryFilter}
            onFromChange={setFromFilter}
            onToChange={setToFilter}
            onReset={resetFilters}
          />
          <ExpensesTable
            expenses={expenses}
            loading={loading}
            page={page}
            total={total}
            pageSize={pageSize}
            deletingId={deletingId}
            onPageChange={setPage}
            onDeleteExpense={requestDeleteExpense}
            canManageExpenses={canManageExpenses}
          />
        </TableSurface>
      </PageSection>

      {canManageExpenses ? (
        <>
          <ExpenseCreateDialog
            open={addOpen}
            saving={saving}
            categoriesLoading={categoriesLoading}
            categories={categories}
            form={form}
            formError={formError}
            fieldErrors={fieldErrors}
            onOpenChange={handleAddDialogChange}
            onFormChange={updateFormField}
            onSubmit={submitCreateExpense}
          />

          <ConfirmDialog
            open={Boolean(deleteTarget)}
            onOpenChange={handleDeleteDialogChange}
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
        </>
      ) : null}
    </PageShell>
  );
}
