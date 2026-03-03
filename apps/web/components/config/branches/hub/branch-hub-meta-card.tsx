import { Building2, CalendarDays, MapPin, Phone } from "lucide-react";
import { type BranchDetail } from "@tbms/shared-types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { formatDate } from "@/lib/utils";

interface BranchHubMetaCardProps {
  branch: BranchDetail | null;
}

export function BranchHubMetaCard({ branch }: BranchHubMetaCardProps) {
  return (
    <Card className="overflow-hidden border-border/70 bg-card/95 shadow-sm">
      <CardHeader variant="rowSection" className="items-start sm:items-center">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
            <Building2 className="h-4 w-4" />
          </div>
          <CardTitle className="text-base font-semibold tracking-tight">Branch Profile</CardTitle>
        </div>
        <Badge variant={branch?.isActive ? "success" : "outline"} size="xs">
          {branch?.isActive ? "Active" : "Inactive"}
        </Badge>
      </CardHeader>

      <CardContent spacing="section" className="space-y-4 p-5 sm:p-6">
        <div className="rounded-lg border border-border/70 bg-muted/20 px-3 py-2.5">
          <Label className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
            Branch ID
          </Label>
          <p className="mt-1 truncate text-sm font-semibold text-foreground">
            {branch?.id || "N/A"}
          </p>
        </div>

        <div className="rounded-lg border border-border/70 bg-muted/20 px-3 py-2.5">
          <Label className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
            Branch Code
          </Label>
          <p className="mt-1 text-sm font-semibold uppercase text-foreground">
            {branch?.code || "N/A"}
          </p>
        </div>

        <div className="flex items-start gap-3 text-sm">
          <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
          <span>{branch?.address || "No address provided yet."}</span>
        </div>

        <div className="flex items-center gap-3 text-sm">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <span>{branch?.phone || "No phone provided yet."}</span>
        </div>

        <div className="grid grid-cols-1 gap-3 border-t border-border/70 pt-4 sm:grid-cols-2">
          <div className="rounded-lg border border-border/60 bg-background/35 px-3 py-2">
            <Label variant="dashboard">Created</Label>
            <div className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{branch?.createdAt ? formatDate(branch.createdAt) : "N/A"}</span>
            </div>
          </div>
          <div className="rounded-lg border border-border/60 bg-background/35 px-3 py-2">
            <Label variant="dashboard">Last Updated</Label>
            <div className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{branch?.updatedAt ? formatDate(branch.updatedAt) : "N/A"}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
