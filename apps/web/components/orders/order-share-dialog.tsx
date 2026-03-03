import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Public Status Share</DialogTitle>
          <DialogDescription>
            Share this link with your customer so they can track their order
            status.
          </DialogDescription>
        </DialogHeader>

        {shareData ? (
          <div className="space-y-6 py-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground">
                Public URL
              </Label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={publicUrl}
                  className="flex-1 bg-muted/30 font-mono text-xs"
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => onCopy(publicUrl)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-primary/20 bg-primary/5 p-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-tight text-primary/60">
                  Access PIN
                </p>
                <p className="text-3xl font-bold tracking-tight text-primary">
                  {shareData.pin}
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="font-bold text-primary"
                onClick={() => onCopy(shareData.pin)}
              >
                Copy PIN
              </Button>
            </div>

            <p className="text-center text-[10px] font-bold text-muted-foreground">
              * Customers will need the 4-digit PIN to access their order
              details.
            </p>
          </div>
        ) : null}

        <DialogFooter>
          <Button variant="outline" className="w-full" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
