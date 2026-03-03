import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";

interface GarmentDetailNotFoundProps {
  onBack: () => void;
}

export function GarmentDetailNotFound({ onBack }: GarmentDetailNotFoundProps) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
      <div className="mb-4 rounded-full bg-destructive/10 p-4">
        <AlertCircle className="h-8 w-8 text-destructive" />
      </div>

      <Typography as="h2" variant="sectionTitle">
        Garment Not Found
      </Typography>
      <Typography as="p" variant="lead" className="mt-2">
        The garment you are looking for doesn&apos;t exist or has been deleted.
      </Typography>

      <Button className="mt-6" onClick={onBack}>
        Go Back
      </Button>
    </div>
  );
}
