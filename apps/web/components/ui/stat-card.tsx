import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Heading, Text } from "@/components/ui/typography";
import { statusIconStyles, statusTextStyles } from "@/lib/ui-styles";
import { cn } from "@/lib/utils";

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
      success: statusTextStyles.success,
      warning: statusTextStyles.warning,
      destructive: "text-destructive",
      info: statusTextStyles.info,
    },
  },
  defaultVariants: {
    tone: "default",
  },
});

const statIconTone = cva(
  "flex h-10 w-10 items-center justify-center rounded-lg border",
  {
    variants: {
      tone: {
        default: "border-border bg-muted text-muted-foreground",
        primary: "border-primary/20 bg-primary/10 text-primary",
        success: statusIconStyles.success,
        warning: statusIconStyles.warning,
        destructive: statusIconStyles.destructive,
        info: statusIconStyles.info,
      },
    },
    defaultVariants: {
      tone: "default",
    },
  },
);

const statBadgeTone: Record<
  NonNullable<StatCardProps["tone"]>,
  NonNullable<React.ComponentProps<typeof Badge>["variant"]>
> = {
  default: "outline",
  primary: "default",
  success: "success",
  warning: "warning",
  destructive: "destructive",
  info: "info",
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

  return (
    <Card
      className={cn(
        "overflow-hidden",
        statCardTone({ tone: resolvedTone }),
        className,
      )}
    >
      <CardHeader
        density="compact"
        align="start"
        gap="sm"
        className="flex-row items-center justify-between gap-3 border-b border-border rounded-none bg-muted/40 px-6 py-4"
      >
        <div className="space-y-1">
          <CardTitle className="text-base font-semibold text-foreground">
            {title}
          </CardTitle>
          {subtitle ? (
            <Label className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
              {subtitle}
            </Label>
          ) : null}
        </div>

        {icon ? (
          <div className={statIconTone({ tone: resolvedIconTone })}>{icon}</div>
        ) : null}
      </CardHeader>

      <CardContent
        spacing="section"
        className={cn("space-y-2 p-5", contentClassName)}
      >
        <div className="flex items-center gap-2">
          <Heading
            as="div"
            variant="stat"
            className={cn(
              statValueTone({ tone: resolvedValueTone }),
              valueClassName,
            )}
          >
            {value}
          </Heading>
          {badgeText ? (
            <Badge variant={statBadgeTone[resolvedTone]} size="xs">
              {badgeText}
            </Badge>
          ) : null}
        </div>

        {helperText ? (
          <Text as="p" variant="meta" className="text-muted-foreground">
            {helperText}
          </Text>
        ) : null}

        {action ? <div>{action}</div> : null}
      </CardContent>
    </Card>
  );
}
