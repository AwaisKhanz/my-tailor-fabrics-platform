"use client";

import { BranchGlobalPricingCard } from "@/components/config/branches/hub/branch-global-pricing-card";
import { BranchHubBreadcrumbs } from "@/components/config/branches/hub/branch-hub-breadcrumbs";
import { BranchHubOverviewHeader } from "@/components/config/branches/hub/branch-hub-overview-header";
import { BranchHubRelationsGrid } from "@/components/config/branches/hub/branch-hub-relations-grid";
import { BranchHubSkeleton } from "@/components/config/branches/hub/branch-hub-skeleton";
import { PageShell, PageSection } from "@/components/ui/page-shell";
import { useBranchHubConfigPage } from "@/hooks/use-branch-hub-config-page";

interface BranchHubConfigProps {
  branchId: string;
}

export function BranchHubConfig({ branchId }: BranchHubConfigProps) {
  const { loading, branch } = useBranchHubConfigPage(branchId);

  if (loading) {
    return <BranchHubSkeleton />;
  }

  return (
    <PageShell
      spacing="spacious"
      inset="relaxed"
      className="animate-in fade-in duration-500"
    >
      <PageSection spacing="spacious">
        <BranchHubBreadcrumbs branchName={branch?.name} />
        <div className="flex flex-col gap-6">
          <BranchHubOverviewHeader branch={branch} />
          <BranchHubRelationsGrid branch={branch} />
        </div>
      </PageSection>

      <BranchGlobalPricingCard />
    </PageShell>
  );
}
