import * as React from "react";
import { MinusIcon, TrendingDownIcon, TrendingUpIcon } from "lucide-react";
import { Badge } from "@tbms/ui/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@tbms/ui/components/card";
import { cn } from "@tbms/ui/lib/utils";

export interface RichSalesStatProps {
  title: string;
  value: React.ReactNode;
  trendValue?: number;
  footerLabel?: React.ReactNode;
  footerSubtext?: React.ReactNode;
  headerAction?: React.ReactNode;
  badge?: React.ReactNode;
  className?: string;
}

export function RichSalesStat({
  title,
  value,
  trendValue = 0,
  footerLabel,
  footerSubtext,
  headerAction,
  badge,
  className,
}: RichSalesStatProps) {
  const isPositive = trendValue > 0;
  const isNeutral = trendValue === 0;

  const TrendIcon = isNeutral
    ? MinusIcon
    : isPositive
      ? TrendingUpIcon
      : TrendingDownIcon;

  const formattedTrend = isNeutral ? "0%" : `${isPositive ? "+" : ""}${trendValue}%`;

  const trendBadge = (
    <Badge
      variant={isNeutral ? "secondary" : isPositive ? "default" : "destructive"}
      className="gap-1 px-1.5 py-0.5"
    >
      <TrendIcon className="size-3" />
      {formattedTrend}
    </Badge>
  );

  return (
    <Card className={cn("@container/card h-full", className)}>
      <CardHeader className="flex items-start justify-between gap-2">
        <div>
          <CardDescription className="font-medium">{title}</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {value}
          </CardTitle>
        </div>
        {headerAction ?? badge ?? trendBadge}
      </CardHeader>

      {(footerLabel || footerSubtext) && (
        <CardContent className="space-y-1.5 pt-0 text-sm">
          {footerLabel ? (
            <div className="line-clamp-1 flex items-center gap-1.5 font-medium">
              {footerLabel}
              <TrendIcon
                className={cn(
                  "size-3.5",
                  isNeutral
                    ? "text-muted-foreground"
                    : isPositive
                      ? "text-primary"
                      : "text-destructive",
                )}
              />
            </div>
          ) : null}
          {footerSubtext ? (
            <div className="text-muted-foreground">{footerSubtext}</div>
          ) : null}
        </CardContent>
      )}
    </Card>
  );
}
