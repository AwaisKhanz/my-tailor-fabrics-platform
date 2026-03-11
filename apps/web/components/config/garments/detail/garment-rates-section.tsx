import { Banknote, Settings } from "lucide-react";
import {
  type Branch,
  type CreateRateCardInput,
  type GarmentTypeWithAnalytics,
} from "@tbms/shared-types";
import { Button } from "@tbms/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@tbms/ui/components/card";
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
        <CardHeader className="pb-4 sm:flex sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Banknote className="h-4 w-4 text-muted-foreground" />
            <div className="space-y-1">
              <CardTitle className="text-base">Production Rates (Step-based)</CardTitle>
              <CardDescription>
                Define how much tailors are paid for each step of this garment.
              </CardDescription>
            </div>
          </div>

          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
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

        <CardContent>
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
