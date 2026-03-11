"use client";

import { AlertCircle } from "lucide-react";
import { StatusOrderDetailsCard } from "@/components/status/status-order-details-card";
import { StatusOrderHeaderCard } from "@/components/status/status-order-header-card";
import { StatusOrderItemsCard } from "@/components/status/status-order-items-card";
import { StatusPinGateCard } from "@/components/status/status-pin-gate-card";
import { EmptyState } from "@tbms/ui/components/empty-state";
import { PageSection, PageShell } from "@tbms/ui/components/page-shell";
import { Text } from "@tbms/ui/components/typography";
import { usePublicOrderStatusPage } from "@/hooks/use-public-order-status-page";
import { siteConfig } from "@/lib/config";

type OrderStatusPageProps = {
  token: string;
};

export function OrderStatusPage({ token }: OrderStatusPageProps) {
  const {
    pin,
    order,
    loading,
    submitted,
    error,
    statusConfig,
    setPin,
    verifyPin,
  } = usePublicOrderStatusPage({ token });

  if (!submitted) {
    return (
      <PageShell width="narrow" viewport="screenRoomy">
        <PageSection layout="center">
          <StatusPinGateCard
            pin={pin}
            loading={loading}
            error={error}
            onPinChange={setPin}
            onSubmit={verifyPin}
          />
        </PageSection>
      </PageShell>
    );
  }

  if (!order || !statusConfig) {
    return (
      <PageShell width="content" viewport="screen">
        <PageSection className="pt-6">
          <EmptyState
            icon={AlertCircle}
            title="Status unavailable"
            description="This status link is invalid or has expired. Please request a fresh link from the tailor shop."
            action={{
              label: "Try Again",
              onClick: () => window.location.reload(),
            }}
          />
        </PageSection>
      </PageShell>
    );
  }

  return (
    <PageShell width="content" viewport="screen">
      <PageSection spacing="compact" className="pt-2 sm:pt-4">
        <StatusOrderHeaderCard
          order={order}
          label={statusConfig.label}
          variant={statusConfig.variant}
          icon={statusConfig.icon}
        />

        <StatusOrderDetailsCard order={order} />
        <StatusOrderItemsCard order={order} />
      </PageSection>

      <PageSection spacing="compact">
        <Text as="p" variant="muted" className="pb-8 text-center text-xs">
          &copy; {new Date().getFullYear()} {siteConfig.name}. All rights
          reserved.
          <br />
          Contact us at {siteConfig.contact.phone} for any concerns.
        </Text>
      </PageSection>
    </PageShell>
  );
}
