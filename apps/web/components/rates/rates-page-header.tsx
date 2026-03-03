import { ArrowLeft, Banknote as BanknoteIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";

interface RatesPageHeaderProps {
  onBack: () => void;
  onCreate: () => void;
}

export function RatesPageHeader({ onBack, onCreate }: RatesPageHeaderProps) {
  return (
    <div className="flex flex-col items-start gap-3 sm:flex-row sm:gap-4">
      <Button
        variant="tableIcon"
        size="iconSm"
        className="h-10 w-10 shrink-0 rounded-full"
        onClick={onBack}
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>

      <div className="w-full flex-1">
        <PageHeader
          title="Production Rates"
          description={
            <span className="inline-flex items-center gap-2">
              <BanknoteIcon className="h-3.5 w-3.5" />
              Manage step-based labor costs & effective dates
            </span>
          }
          actions={
            <Button variant="premium" size="lg" className="w-full gap-2 sm:w-auto" onClick={onCreate}>
              <Plus className="h-4 w-4" />
              Define New Rate
            </Button>
          }
        />
      </div>
    </div>
  );
}
