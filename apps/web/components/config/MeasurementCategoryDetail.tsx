"use client";

import { useRouter } from "next/navigation";
import { MeasurementFieldDialog } from "@/components/config/MeasurementFieldDialog";
import { MeasurementCategoryBreadcrumbs } from "@/components/config/measurements/detail/measurement-category-breadcrumbs";
import { MeasurementCategoryDetailHeader } from "@/components/config/measurements/detail/measurement-category-detail-header";
import { MeasurementFieldsStatsGrid } from "@/components/config/measurements/detail/measurement-fields-stats-grid";
import { MeasurementFieldsTable } from "@/components/config/measurements/detail/measurement-fields-table";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageShell, PageSection } from "@/components/ui/page-shell";
import { useAuthz } from "@/hooks/use-authz";
import { Typography } from "@/components/ui/typography";
import { useMeasurementCategoryDetailPage } from "@/hooks/use-measurement-category-detail-page";

export function MeasurementCategoryDetail({ id }: { id: string }) {
  const router = useRouter();
  const { canAll } = useAuthz();
  const canManageMeasurements = canAll(["measurements.manage"]);

  const {
    loading,
    category,
    notFound,
    isFieldDialogOpen,
    selectedField,
    isConfirmOpen,
    fieldToDelete,
    openAddFieldDialog,
    openEditFieldDialog,
    closeFieldDialog,
    requestDeleteField,
    closeDeleteConfirm,
    confirmDeleteField,
    fetchCategory,
  } = useMeasurementCategoryDetailPage(id);

  if (!loading && notFound) {
    return (
      <PageShell width="narrow">
        <PageSection spacing="compact">
          <Card className="border-border/70 bg-card/95 shadow-sm">
            <CardContent className="flex min-h-[340px] flex-col items-center justify-center p-6 text-center">
              <Typography as="h2" variant="sectionTitle">
                Category Not Found
              </Typography>
              <Typography as="p" variant="lead" className="mt-2 max-w-md">
                This measurement category may have been removed or is no longer available.
              </Typography>
              <Button
                variant="premium"
                className="mt-6 w-full sm:w-auto"
                onClick={() => router.push("/settings/measurements")}
              >
                Back to Measurements
              </Button>
            </CardContent>
          </Card>
        </PageSection>
      </PageShell>
    );
  }

  return (
    <PageShell spacing="spacious">
      <PageSection spacing="compact">
        <MeasurementCategoryBreadcrumbs
          categoryName={category?.name}
          onBack={() => router.push("/settings/measurements")}
        />

        <MeasurementCategoryDetailHeader
          category={category}
          onAddField={openAddFieldDialog}
          canManageMeasurements={canManageMeasurements}
        />
      </PageSection>

      <PageSection spacing="compact">
        <MeasurementFieldsStatsGrid fields={category?.fields || []} />
      </PageSection>

      <PageSection spacing="compact">
        <MeasurementFieldsTable
          fields={category?.fields || []}
          loading={loading}
          onEditField={openEditFieldDialog}
          onDeleteField={requestDeleteField}
          canManageFields={canManageMeasurements}
        />
      </PageSection>

      {canManageMeasurements ? (
        <MeasurementFieldDialog
          open={isFieldDialogOpen}
          onOpenChange={closeFieldDialog}
          categoryId={id}
          categoryName={category?.name}
          initialData={selectedField}
          existingFields={category?.fields || []}
          onSuccess={() => {
            void fetchCategory();
          }}
        />
      ) : null}

      {canManageMeasurements ? (
        <ConfirmDialog
          open={isConfirmOpen}
          onOpenChange={closeDeleteConfirm}
          title="Delete Field"
          description={`Are you sure you want to delete the field "${fieldToDelete?.label}"? This action cannot be undone.`}
          onConfirm={() => {
            void confirmDeleteField();
          }}
          confirmText="Delete Field"
        />
      ) : null}
    </PageShell>
  );
}
