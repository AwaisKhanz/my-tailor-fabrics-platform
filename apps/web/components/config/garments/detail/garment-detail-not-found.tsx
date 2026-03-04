import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageSection, PageShell } from "@/components/ui/page-shell";
import { Typography } from "@/components/ui/typography";

interface GarmentDetailNotFoundProps {
  onBack: () => void;
}

export function GarmentDetailNotFound({ onBack }: GarmentDetailNotFoundProps) {
  return (
    <PageShell width="narrow">
      <PageSection spacing="compact">
        <Card>
          <CardContent className="flex min-h-[360px] flex-col items-center justify-center p-6 text-center">
            <div className="mb-4 rounded-full bg-destructive/10 p-4">
              <AlertCircle className="h-8 w-8 text-error" />
            </div>

            <Typography as="h2" variant="sectionTitle">
              Garment Not Found
            </Typography>
            <Typography as="p" variant="lead" className="mt-2 max-w-md">
              The garment you are looking for doesn&apos;t exist or may have been removed.
            </Typography>

            <Button variant="premium" className="mt-6 w-full sm:w-auto" onClick={onBack}>
              Back to Garments
            </Button>
          </CardContent>
        </Card>
      </PageSection>
    </PageShell>
  );
}
