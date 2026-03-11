import { Card, CardContent } from "@tbms/ui/components/card";
import { Label } from "@tbms/ui/components/label";
import { Text } from "@tbms/ui/components/typography";

interface CustomerNotesTabProps {
  notes?: string | null;
}

export function CustomerNotesTab({ notes }: CustomerNotesTabProps) {
  return (
    <Card>
      <CardContent className="space-y-2">
        <Label className="text-xs uppercase  text-muted-foreground">
          Preferences & Internal Notes
        </Label>
        <Text as="p" variant="lead" className="whitespace-pre-wrap">
          {notes ||
            "No special notes or preferences recorded for this customer."}
        </Text>
      </CardContent>
    </Card>
  );
}
