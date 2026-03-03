import { ArrowLeft, Layout, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";

interface DesignTypesPageHeaderProps {
  onBack: () => void;
  onCreate: () => void;
}

export function DesignTypesPageHeader({ onBack, onCreate }: DesignTypesPageHeaderProps) {
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
          title="Design Types"
          description={
            <span className="inline-flex items-center gap-2">
              <Layout className="h-3.5 w-3.5" />
              Standardize pricing for different design complexities
            </span>
          }
          actions={
            <Button variant="premium" className="w-full gap-2 sm:w-auto" onClick={onCreate}>
              <Plus className="h-4 w-4" />
              Add Design Type
            </Button>
          }
        />
      </div>
    </div>
  );
}
