import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Typography } from "@/components/ui/typography";

interface CustomerNotesTabProps {
  notes?: string | null;
}

export function CustomerNotesTab({ notes }: CustomerNotesTabProps) {
  return (
    <Card>
      <CardContent spacing="section" className="space-y-2 p-5 sm:p-6">
        <Label variant="microCaps">
          Preferences & Internal Notes
        </Label>
        <Typography as="p" variant="lead" className="whitespace-pre-wrap">
          {notes || "No special notes or preferences recorded for this customer."}
        </Typography>
      </CardContent>
    </Card>
  );
}
