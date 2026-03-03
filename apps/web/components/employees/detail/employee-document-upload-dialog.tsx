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

interface EmployeeDocumentUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  label: string;
  url: string;
  uploading: boolean;
  onLabelChange: (value: string) => void;
  onUrlChange: (value: string) => void;
  onSubmit: () => void;
}

export function EmployeeDocumentUploadDialog({
  open,
  onOpenChange,
  label,
  url,
  uploading,
  onLabelChange,
  onUrlChange,
  onSubmit,
}: EmployeeDocumentUploadDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Add Document</DialogTitle>
          <DialogDescription>
            Attach a file URL for this employee&apos;s records.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Document Label</Label>
            <Input
              placeholder="e.g. CNIC Front"
              value={label}
              onChange={(event) => onLabelChange(event.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>File URL</Label>
            <Input
              placeholder="https://..."
              value={url}
              onChange={(event) => onUrlChange(event.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={uploading || !label || !url}>
            {uploading ? "Saving..." : "Add Document"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
