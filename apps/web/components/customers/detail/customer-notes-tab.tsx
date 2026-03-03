import { Card, CardContent } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";

interface CustomerNotesTabProps {
  notes?: string | null;
}

export function CustomerNotesTab({ notes }: CustomerNotesTabProps) {
  return (
    <div className="pt-4">
      <Card className="border-border/50 shadow-sm">
        <CardContent className="pt-6">
          <Typography as="p" variant="lead" className="whitespace-pre-wrap">
            {notes || "No special notes or preferences recorded for this customer."}
          </Typography>
        </CardContent>
      </Card>
    </div>
  );
}
