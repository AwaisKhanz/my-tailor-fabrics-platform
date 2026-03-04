import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Typography } from "@/components/ui/typography";

interface CustomerNotesTabProps {
  notes?: string | null;
}

export function CustomerNotesTab({ notes }: CustomerNotesTabProps) {
  return (
    <Card>
      <CardContent spacing="section" padding="inset" className="space-y-2">
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
