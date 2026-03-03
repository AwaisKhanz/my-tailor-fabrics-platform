import { ChevronRight } from "lucide-react";

interface BranchHubBreadcrumbsProps {
  branchCode?: string;
  onBack: () => void;
}

export function BranchHubBreadcrumbs({
  branchCode,
  onBack,
}: BranchHubBreadcrumbsProps) {
  return (
    <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold tracking-wide text-muted-foreground">
      <button
        type="button"
        className="rounded-sm transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        onClick={onBack}
      >
        Branches
      </button>
      <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
      <span className="font-medium text-foreground">{(branchCode || "Branch").toUpperCase()}</span>
    </div>
  );
}
