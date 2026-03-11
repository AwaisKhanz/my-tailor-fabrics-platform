import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Badge } from "@tbms/ui/components/badge";
import { RichSalesStat } from "@tbms/ui/components/blocks/stats/rich-sales-stat";
import { cn } from "@tbms/ui/lib/utils";

const statCardTone = cva("", {
  variants: {
    tone: {
      default: "",
      primary: "",
      success: "",
      warning: "",
      destructive: "",
      info: "",
    },
  },
  defaultVariants: {
    tone: "default",
  },
});

const statValueTone = cva("text-3xl", {
  variants: {
    tone: {
      default: "text-foreground",
      primary: "text-primary",
      success: "text-primary",
      warning: "text-foreground",
      destructive: "text-destructive",
      info: "text-foreground",
    },
  },
  defaultVariants: {
    tone: "default",
  },
});

const statIconTone = cva("", {
  variants: {
    tone: {
      default: "border-border bg-card text-muted-foreground",
      primary: "border-border bg-card text-primary",
      success: "border-border bg-card text-foreground",
      warning: "border-border bg-card text-foreground",
      destructive: "border-border bg-card text-destructive",
      info: "border-border bg-card text-foreground",
    },
  },
  defaultVariants: {
    tone: "default",
  },
});

const statBadgeTone: Record<
  NonNullable<StatCardProps["tone"]>,
  NonNullable<React.ComponentProps<typeof Badge>["variant"]>
> = {
  default: "outline",
  primary: "default",
  success: "default",
  warning: "secondary",
  destructive: "destructive",
  info: "secondary",
};

export interface StatCardProps extends VariantProps<typeof statCardTone> {
  title: string;
  subtitle?: string;
  value: React.ReactNode;
  helperText?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  badgeText?: string;
  iconTone?: NonNullable<VariantProps<typeof statIconTone>["tone"]>;
  valueTone?: NonNullable<VariantProps<typeof statValueTone>["tone"]>;
  className?: string;
  contentClassName?: string;
  valueClassName?: string;
}

const toneTrendValue: Record<
  NonNullable<StatCardProps["tone"]>,
  number
> = {
  default: 0,
  primary: 1,
  success: 1,
  warning: -1,
  destructive: -1,
  info: 0,
};

export function StatCard({
  title,
  subtitle,
  value,
  helperText,
  action,
  icon,
  badgeText,
  tone = "default",
  iconTone,
  valueTone,
  className,
  contentClassName,
  valueClassName,
}: StatCardProps) {
  const resolvedTone = tone ?? "default";
  const resolvedIconTone = iconTone ?? resolvedTone;
  const resolvedValueTone = valueTone ?? resolvedTone;
  const hasBadge = Boolean(badgeText || icon);

  const headerBadge =
    hasBadge ? (
      <Badge
        variant={statBadgeTone[resolvedTone]}
        className={cn(
          "gap-1 px-1.5 py-0.5",
          icon ? statIconTone({ tone: resolvedIconTone }) : undefined,
        )}
      >
        {icon}
        {badgeText}
      </Badge>
    ) : undefined;

  return (
    <RichSalesStat
      title={title}
      value={
        <span
          className={cn(
            "text-foreground",
            statValueTone({ tone: resolvedValueTone }),
            valueClassName,
          )}
        >
          {value}
        </span>
      }
      trendValue={toneTrendValue[resolvedTone]}
      footerLabel={subtitle}
      footerSubtext={helperText}
      headerAction={action}
      badge={action ? undefined : headerBadge}
      className={cn(statCardTone({ tone: resolvedTone }), className, contentClassName)}
    />
  );
}
