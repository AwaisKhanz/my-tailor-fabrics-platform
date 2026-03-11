import { Button } from "@tbms/ui/components/button";
import { FormStack } from "@tbms/ui/components/form-layout";
import { FieldLabel } from "@tbms/ui/components/field";
import { InfoTile } from "@tbms/ui/components/info-tile";
import { Input } from "@tbms/ui/components/input";
import { ScrollableDialog } from "@tbms/ui/components/scrollable-dialog";
import { Text } from "@tbms/ui/components/typography";
import { Copy } from "lucide-react";

interface ShareData {
  token: string;
  pin: string;
}

interface OrderShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shareData: ShareData | null;
  publicUrl: string;
  onCopy: (text: string) => void;
}

export function OrderShareDialog({
  open,
  onOpenChange,
  shareData,
  publicUrl,
  onCopy,
}: OrderShareDialogProps) {
  return (
    <ScrollableDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Public Status Share"
      description="Share this link with your customer so they can track their order status."
      footerActions={
        <Button variant="outline" className="w-full" onClick={() => onOpenChange(false)}>
          Close
        </Button>
      }
    >
      {shareData ? (
        <FormStack density="relaxed">
          <FormStack density="compact">
            <FieldLabel size="compact">Public URL</FieldLabel>
            <div className="flex gap-2">
              <Input
                readOnly
                value={publicUrl}
                className="flex-1 font-mono text-xs"
              />
              <Button size="icon" onClick={() => onCopy(publicUrl)}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </FormStack>

          <InfoTile tone="info" padding="contentLg" layout="betweenGap" radius="xl">
            <div>
              <Text as="p" variant="meta" className="text-primary/70">
                Access PIN
              </Text>
              <Text as="p" variant="body" className="text-3xl font-bold text-primary">
                {shareData.pin}
              </Text>
            </div>
            <Button size="sm" variant="ghost" onClick={() => onCopy(shareData.pin)}>
              Copy PIN
            </Button>
          </InfoTile>

          <Text as="p" variant="meta" className="text-center normal-case">
            Customers need the 4-digit PIN to access order details.
          </Text>
        </FormStack>
      ) : null}
    </ScrollableDialog>
  );
}
