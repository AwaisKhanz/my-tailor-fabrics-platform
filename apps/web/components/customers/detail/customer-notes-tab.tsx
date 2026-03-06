import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/typography";

interface CustomerNotesTabProps {
  notes?: string | null;
}

export function CustomerNotesTab({ notes }: CustomerNotesTabProps) {
  return (
    <Card>
      <CardContent spacing="section" padding="inset" className="space-y-2">
        <Label className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Preferences & Internal Notes</Label>
        <Text as="p"  variant="lead" className="whitespace-pre-wrap">
          {notes ||
            "No special notes or preferences recorded for this customer."}
        </Text>
      </CardContent>
    </Card>
  );
}
