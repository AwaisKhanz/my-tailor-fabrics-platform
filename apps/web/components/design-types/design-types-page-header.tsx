import { Layout, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";

interface DesignTypesPageHeaderProps {
  onCreate: () => void;
}

export function DesignTypesPageHeader({ onCreate }: DesignTypesPageHeaderProps) {
  return (
    <PageHeader
      title="Design Types"
      description={
        <span className="inline-flex items-center gap-2">
          <Layout className="h-3.5 w-3.5" />
          Standardize pricing for different design complexities.
        </span>
      }
      actions={
        <Button variant="premium" size="lg" className="w-full gap-2 sm:w-auto" onClick={onCreate}>
          <Plus className="h-4 w-4" />
          Add Design Type
        </Button>
      }
    />
  );
}
