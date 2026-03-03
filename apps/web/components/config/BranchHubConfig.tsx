"use client";

import { useRouter } from "next/navigation";
import { BranchGlobalPricingCard } from "@/components/config/branches/hub/branch-global-pricing-card";
import { BranchHubBreadcrumbs } from "@/components/config/branches/hub/branch-hub-breadcrumbs";
import { BranchHubMetaCard } from "@/components/config/branches/hub/branch-hub-meta-card";
import { BranchHubOverviewHeader } from "@/components/config/branches/hub/branch-hub-overview-header";
import { BranchHubRelationsGrid } from "@/components/config/branches/hub/branch-hub-relations-grid";
import { BranchHubSkeleton } from "@/components/config/branches/hub/branch-hub-skeleton";
import { PageShell, PageSection } from "@/components/ui/page-shell";
import { useBranchHubConfigPage } from "@/hooks/use-branch-hub-config-page";

interface BranchHubConfigProps {
  branchId: string;
}

export function BranchHubConfig({ branchId }: BranchHubConfigProps) {
  const router = useRouter();
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
      <PageSection spacing="compact">
        <BranchHubBreadcrumbs
          branchCode={branch?.code}
          onBack={() => router.push("/settings/branches")}
        />
        <BranchHubOverviewHeader branch={branch} />
      </PageSection>

      <PageSection spacing="compact">
        <BranchHubRelationsGrid branch={branch} />
      </PageSection>

      <PageSection
        spacing="compact"
        className="grid grid-cols-1 gap-6 space-y-0 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]"
      >
        <BranchGlobalPricingCard branch={branch} />
        <BranchHubMetaCard branch={branch} />
      </PageSection>
    </PageShell>
  );
}
