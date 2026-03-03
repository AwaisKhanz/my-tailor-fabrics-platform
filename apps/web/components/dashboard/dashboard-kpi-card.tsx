import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardKpiCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  badgeText?: string;
  badgeVariant?: "success" | "info" | "destructive";
  iconBoxClass?: string;
  iconClass?: string;
  loading?: boolean;
}

export function DashboardKpiCard({
  title,
  value,
  icon: Icon,
  badgeText,
  badgeVariant,
  iconBoxClass,
  iconClass,
  loading,
}: DashboardKpiCardProps) {
  return (
    <Card className="border-border/70 bg-card transition-shadow hover:shadow-md">
      <CardContent spacing="section" className="p-5">
        <div className="mb-5 flex items-start justify-between">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${iconBoxClass || "bg-muted"}`}
          >
            <Icon className={`h-6 w-6 ${iconClass || "text-muted-foreground"}`} />
          </div>
          {badgeText ? (
            <Badge variant={badgeVariant || "outline"} size="xs">
              {badgeText}
            </Badge>
          ) : null}
        </div>

        <div>
          {loading ? (
            <>
              <Skeleton className="mb-1 h-4 w-24" />
              <Skeleton className="h-8 w-32" />
            </>
          ) : (
            <>
              <Label className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {title}
              </Label>
              <div
                className={`text-2xl font-extrabold tracking-tight sm:text-3xl ${badgeVariant === "destructive" ? "text-destructive" : "text-foreground"}`}
              >
                {value}
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
