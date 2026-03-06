import * as React from "react";
import { cn } from "@/lib/utils";
import { CardDescription, CardTitle } from "@/components/ui/card";

type SectionHeaderTitleVariant = "section" | "dashboard" | "dashboardSection";
type SectionHeaderDescriptionVariant = "default" | "header" | "compact";

const titleVariantClasses: Record<SectionHeaderTitleVariant, string> = {
  section: "text-base font-semibold tracking-tight",
  dashboard: "text-sm font-bold uppercase tracking-tight text-muted-foreground",
  dashboardSection: "text-base font-bold normal-case tracking-tight",
};

const descriptionVariantClasses: Record<SectionHeaderDescriptionVariant, string> = {
  default: "",
  header: "mt-1 text-xs",
  compact: "text-xs",
};

interface SectionHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  titleVariant?: SectionHeaderTitleVariant;
  descriptionVariant?: SectionHeaderDescriptionVariant;
  className?: string;
  textClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
}

export function SectionHeader({
  title,
  description,
  icon,
  titleVariant = "section",
  descriptionVariant = "header",
  className,
  textClassName,
  titleClassName,
  descriptionClassName,
}: SectionHeaderProps) {
  return (
    <div className={cn("flex items-start gap-3", className)}>
      {icon ? <div className="shrink-0">{icon}</div> : null}
      <div className={cn("min-w-0 space-y-1", textClassName)}>
        <CardTitle
          className={cn(
            titleVariantClasses[titleVariant],
            description ? "" : "mt-1",
            titleClassName,
          )}
        >
          {title}
        </CardTitle>
        {description ? (
          <CardDescription
            className={cn(
              descriptionVariantClasses[descriptionVariant],
              descriptionClassName,
            )}
          >
            {description}
          </CardDescription>
        ) : null}
      </div>
    </div>
  );
}
