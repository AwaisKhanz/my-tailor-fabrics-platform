import { Banknote, Settings } from "lucide-react";
import { type Branch, type CreateRateCardInput, type GarmentTypeWithAnalytics } from "@tbms/shared-types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateRateDialog } from "@/components/rates/CreateRateDialog";
import { RatesList } from "@/components/rates/RatesList";

interface GarmentRatesSectionProps {
  garment: GarmentTypeWithAnalytics;
  branches: Branch[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateRate: (data: CreateRateCardInput) => Promise<void>;
}

export function GarmentRatesSection({
  garment,
  branches,
  open,
  onOpenChange,
  onCreateRate,
}: GarmentRatesSectionProps) {
  return (
    <>
      <Card className="mt-6 border-border/50 shadow-sm">
        <CardHeader variant="rowSection" className="items-start sm:items-center">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Banknote className="h-4 w-4 text-primary" />
              <CardTitle variant="dashboard" className="text-primary">
                Production Rates (Step-based)
              </CardTitle>
            </div>
            <CardDescription className="text-xs">
              Define how much tailors are paid for each step of this garment.
            </CardDescription>
          </div>

          <Button
            size="sm"
            className="h-8 gap-2 text-[10px] font-bold uppercase tracking-wider"
            onClick={() => onOpenChange(true)}
          >
            <Settings className="h-3 w-3" />
            Update Rates
          </Button>
        </CardHeader>

        <CardContent spacing="section">
          <RatesList rates={garment.rateCards || []} />
        </CardContent>
      </Card>

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
    </>
  );
}
