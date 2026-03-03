import { Banknote, Settings } from "lucide-react";
import { type Branch, type CreateRateCardInput, type GarmentTypeWithAnalytics } from "@tbms/shared-types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  const activeRatesCount = garment.rateCards?.length ?? 0;

  return (
    <>
      <Card className="overflow-hidden border-border/70 bg-card/95 shadow-sm">
        <CardHeader variant="rowSection" className="items-start gap-3 sm:items-center">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
                <Banknote className="h-4 w-4" />
              </div>
              <CardTitle className="text-base font-semibold tracking-tight">
                Production Rates (Step-based)
              </CardTitle>
            </div>
            <CardDescription className="text-xs">
              Define how much tailors are paid for each step of this garment.
            </CardDescription>
          </div>

          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
            <Badge variant="secondary" size="xs">
              {activeRatesCount} active rate{activeRatesCount === 1 ? "" : "s"}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-2"
              onClick={() => onOpenChange(true)}
            >
              <Settings className="h-3.5 w-3.5" />
              Update Rates
            </Button>
          </div>
        </CardHeader>

        <CardContent spacing="section" className="p-5 sm:p-6">
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
