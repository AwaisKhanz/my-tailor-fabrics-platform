import { Banknote, Settings } from "lucide-react";
import {
  type Branch,
  type CreateRateCardInput,
  type GarmentTypeWithAnalytics,
} from "@tbms/shared-types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { SectionIcon } from "@/components/ui/section-icon";
import { CreateRateDialog } from "@/components/rates/CreateRateDialog";
import { RatesList } from "@/components/rates/RatesList";

interface GarmentRatesSectionProps {
  garment: GarmentTypeWithAnalytics;
  branches: Branch[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateRate: (data: CreateRateCardInput) => Promise<void>;
  canManageRates?: boolean;
}

export function GarmentRatesSection({
  garment,
  branches,
  open,
  onOpenChange,
  onCreateRate,
  canManageRates = true,
}: GarmentRatesSectionProps) {
  return (
    <>
      <Card>
        <CardHeader layout="rowBetweenStart" surface="mutedSection" trimBottom>
          <SectionHeader
            title="Production Rates (Step-based)"
            description="Define how much tailors are paid for each step of this garment."
            descriptionVariant="compact"
            icon={
              <SectionIcon tone="default">
                <Banknote className="h-4 w-4" />
              </SectionIcon>
            }
          />

          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
            {/* <Badge variant="default" size="xs">
              {activeRatesCount} active rate{activeRatesCount === 1 ? "" : "s"}
            </Badge> */}
            {canManageRates ? (
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-2"
                onClick={() => onOpenChange(true)}
              >
                <Settings className="h-3.5 w-3.5" />
                Update Rates
              </Button>
            ) : null}
          </div>
        </CardHeader>

        <CardContent spacing="section" padding="inset">
          <RatesList rates={garment.rateCards || []} />
        </CardContent>
      </Card>

      {canManageRates ? (
        <CreateRateDialog
          open={open}
          onOpenChange={onOpenChange}
          onSubmit={onCreateRate}
          garmentTypes={[{ id: garment.id, name: garment.name }]}
          branches={branches.map((branch) => ({
            id: branch.id,
            name: branch.name,
            code: branch.code,
          }))}
          steps={garment.workflowSteps?.map((step) => step.stepKey) || []}
        />
      ) : null}
    </>
  );
}
