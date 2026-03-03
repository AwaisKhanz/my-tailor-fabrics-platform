import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Label } from "@/components/ui/label";

interface BranchHubBreadcrumbsProps {
  branchName?: string;
}

export function BranchHubBreadcrumbs({ branchName }: BranchHubBreadcrumbsProps) {
  return (
    <nav className="flex items-center gap-2">
      <Link href="/" className="transition-colors hover:text-primary">
        <Label variant="dashboard" className="cursor-pointer">
          Home
        </Label>
      </Link>
      <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
      <Link href="/settings/branches" className="transition-colors hover:text-primary">
        <Label variant="dashboard" className="cursor-pointer">
          Branches
        </Label>
      </Link>
      <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
      <Label variant="dashboard" className="text-foreground opacity-100">
        {branchName || "Branch"} Overview
      </Label>
    </nav>
  );
}
