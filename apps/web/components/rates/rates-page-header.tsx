import { Banknote as BanknoteIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";

interface RatesPageHeaderProps {
  onCreate: () => void;
  canCreateRate?: boolean;
}

export function RatesPageHeader({
  onCreate,
  canCreateRate = true,
}: RatesPageHeaderProps) {
  return (
    <PageHeader
      title="Labor Rates"
      description={
        <span className="inline-flex items-center gap-2">
          <BanknoteIcon className="h-3.5 w-3.5" />
          Manage step-based production payouts and effective dates.
        </span>
      }
      actions={canCreateRate ? (
        <Button variant="default" size="lg" className="w-full gap-2 sm:w-auto" onClick={onCreate}>
          <Plus className="h-4 w-4" />
          Define New Rate
        </Button>
      ) : null}
    />
  );
}
