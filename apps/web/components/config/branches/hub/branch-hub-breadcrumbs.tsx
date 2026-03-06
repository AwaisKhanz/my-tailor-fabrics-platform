import { EntityBreadcrumb } from "@/components/ui/entity-breadcrumb";

interface BranchHubBreadcrumbsProps {
  branchCode?: string;
  onBack: () => void;
}

export function BranchHubBreadcrumbs({
  branchCode,
  onBack,
}: BranchHubBreadcrumbsProps) {
  return (
    <EntityBreadcrumb
      sectionLabel="Branches"
      currentLabel={(branchCode || "Branch").toUpperCase()}
      separatorClassName="text-muted-foreground/60"
      onBack={onBack}
    />
  );
}
