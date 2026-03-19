import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@tbms/ui/components/card";
import { Badge } from "@tbms/ui/components/badge";
import { Separator } from "@tbms/ui/components/separator";
import { formatPKR } from "@/lib/utils";

interface OrderFormReviewCardProps {
  customerName: string | null;
  dueDate: string;
  pieceSummaries: Array<{
    key: string;
    label: string;
    designLabel: string;
    fabricLabel: string;
    fabricModeLabel: string;
    notes: string;
    tailoringTotal: number;
    designTotal: number;
    addonTotal: number;
    shopFabricTotal: number;
    total: number;
  }>;
}

export function OrderFormReviewCard({
  customerName,
  dueDate,
  pieceSummaries,
}: OrderFormReviewCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>Invoice Preview</CardTitle>
          <Badge variant="secondary">{pieceSummaries.length} pieces</Badge>
        </div>
        <CardDescription>
          Final counter check before saving. Review each piece the same way the
          customer will understand it on the bill.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 rounded-lg border p-4 md:grid-cols-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Customer
            </p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {customerName || "Not selected"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Due Date
            </p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {dueDate || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              What to verify
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Garment, design, fabric source, and piece total.
            </p>
          </div>
        </div>

        {pieceSummaries.map((piece, index) => (
          <div key={piece.key} className="rounded-lg border p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Piece {index + 1}</Badge>
                  <p className="font-semibold text-foreground">{piece.label}</p>
                  <Badge variant="secondary">{piece.fabricModeLabel}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {piece.designLabel} • {piece.fabricLabel}
                </p>
              </div>
              <p className="text-base font-semibold text-foreground">
                {formatPKR(Math.round(piece.total * 100))}
              </p>
            </div>
            <Separator className="my-3" />
            <div className="grid gap-2 text-sm md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-md border px-3 py-2">
                <p className="text-xs font-medium text-muted-foreground">Tailoring</p>
                <p className="mt-1 font-semibold text-foreground">
                  {formatPKR(Math.round(piece.tailoringTotal * 100))}
                </p>
              </div>
              <div className="rounded-md border px-3 py-2">
                <p className="text-xs font-medium text-muted-foreground">Design</p>
                <p className="mt-1 font-semibold text-foreground">
                  {formatPKR(Math.round(piece.designTotal * 100))}
                </p>
              </div>
              <div className="rounded-md border px-3 py-2">
                <p className="text-xs font-medium text-muted-foreground">Addons</p>
                <p className="mt-1 font-semibold text-foreground">
                  {formatPKR(Math.round(piece.addonTotal * 100))}
                </p>
              </div>
              <div className="rounded-md border px-3 py-2">
                <p className="text-xs font-medium text-muted-foreground">Fabric</p>
                <p className="mt-1 font-semibold text-foreground">
                  {formatPKR(Math.round(piece.shopFabricTotal * 100))}
                </p>
              </div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{piece.notes}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
