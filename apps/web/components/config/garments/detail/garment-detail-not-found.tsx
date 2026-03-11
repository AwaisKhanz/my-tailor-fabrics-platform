import { AlertCircle } from "lucide-react";
import { EmptyState } from "@tbms/ui/components/empty-state";
import { PageSection, PageShell } from "@tbms/ui/components/page-shell";

interface GarmentDetailNotFoundProps {
  onBack: () => void;
}

export function GarmentDetailNotFound({ onBack }: GarmentDetailNotFoundProps) {
  return (
    <PageShell width="narrow">
      <PageSection className="flex min-h-[60vh] items-center justify-center">
        <EmptyState
          icon={AlertCircle}
          title="Garment Not Found"
          description="The garment you are looking for does not exist or may have been removed."
          action={{
            label: "Back to Garments",
            onClick: onBack,
          }}
        />
      </PageSection>
    </PageShell>
  );
}
