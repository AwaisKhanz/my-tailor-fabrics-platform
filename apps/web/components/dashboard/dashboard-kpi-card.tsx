import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/ui/stat-card";

interface DashboardKpiCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  badgeText?: string;
  badgeVariant?: "success" | "info" | "destructive";
  helperText?: string;
  loading?: boolean;
}

export function DashboardKpiCard({
  title,
  value,
  icon: Icon,
  badgeText,
  badgeVariant,
  helperText,
  loading,
}: DashboardKpiCardProps) {
  const tone =
    badgeVariant === "success"
      ? "success"
      : badgeVariant === "destructive"
        ? "destructive"
        : badgeVariant === "info"
          ? "info"
          : "default";

  return (
    <StatCard
      tone={tone}
      title={title}
      value={
        loading ? (
          <div className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-28" />
          </div>
        ) : (
          value
        )
      }
      icon={<Icon className="h-4 w-4" />}
      helperText={loading ? undefined : helperText}
      badgeText={loading ? undefined : badgeText}
      className="h-full"
      valueClassName={loading ? "text-foreground" : undefined}
    />
  );
}
