import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DialogActionRow, DialogSection } from "@/components/ui/form-layout";
import { InfoTile } from "@/components/ui/info-tile";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>Public Status Share</DialogTitle>
          <DialogDescription>
            Share this link with your customer so they can track their order
            status.
          </DialogDescription>
        </DialogHeader>

        {shareData ? (
          <DialogSection density="relaxed">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase  text-muted-foreground">
                Public URL
              </Label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={publicUrl}
                  className="flex-1 rounded-xl border-border bg-foreground font-mono text-xs text-background shadow-none"
                />
                <Button size="icon" onClick={() => onCopy(publicUrl)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <InfoTile
              tone="info"
              padding="contentLg"
              layout="betweenGap"
              radius="xl"
            >
              <div>
                <p className="text-xs font-bold uppercase  text-primary/70">
                  Access PIN
                </p>
                <p className="text-3xl font-bold  text-primary">
                  {shareData.pin}
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="font-bold"
                onClick={() => onCopy(shareData.pin)}
              >
                Copy PIN
              </Button>
            </InfoTile>

            <p className="text-center text-xs font-bold text-muted-foreground">
              * Customers will need the 4-digit PIN to access their order
              details.
            </p>
          </DialogSection>
        ) : null}

        <DialogActionRow bordered={false}>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </DialogActionRow>
      </DialogContent>
    </Dialog>
  );
}
