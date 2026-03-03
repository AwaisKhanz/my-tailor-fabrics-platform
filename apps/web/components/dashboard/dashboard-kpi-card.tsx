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
    <Card variant="premium" className="border-border transition-all hover:shadow-lg">
      <CardContent spacing="section">
        <div className="mb-6 flex items-start justify-between">
          <div
            className={`h-12 w-12 shrink-0 rounded-2xl ${iconBoxClass || "bg-muted"} flex items-center justify-center`}
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
              <Label variant="dashboard" className="mb-1">
                {title}
              </Label>
              <div
                className={`text-3xl font-bold tracking-tight ${badgeVariant === "destructive" ? "text-destructive" : "text-foreground"}`}
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
