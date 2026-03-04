"use client";

import { AlertCircle } from "lucide-react";
import { usePublicOrderStatusPage } from "@/hooks/use-public-order-status-page";
import { siteConfig } from "@/lib/config";
import { EmptyState } from "@/components/ui/empty-state";
import { Typography } from "@/components/ui/typography";
import { StatusPageFrame } from "@/components/status/status-page-frame";
import { StatusPinGateCard } from "@/components/status/status-pin-gate-card";
import { StatusOrderHeaderCard } from "@/components/status/status-order-header-card";
import { StatusOrderDetailsCard } from "@/components/status/status-order-details-card";
import { StatusOrderItemsCard } from "@/components/status/status-order-items-card";

export default function OrderStatusPage({ params }: { params: { token: string } }) {
  const { token } = params;

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
      <StatusPageFrame
        width="full"
        layout="centered"
      >
        <StatusPinGateCard
          pin={pin}
          loading={loading}
          error={error}
          onPinChange={setPin}
          onSubmit={verifyPin}
        />
      </StatusPageFrame>
    );
  }

  if (!order || !statusConfig) {
    return (
      <StatusPageFrame>
        <EmptyState
          icon={AlertCircle}
          title="Status unavailable"
          description="This status link is invalid or has expired. Please request a fresh link from the tailor shop."
          action={{
            label: "Try Again",
            onClick: () => window.location.reload(),
          }}
        />
      </StatusPageFrame>
    );
  }

  return (
    <StatusPageFrame sectionClassName="pt-2 sm:pt-4">
      <StatusOrderHeaderCard
        order={order}
        label={statusConfig.label}
        variant={statusConfig.variant}
        icon={statusConfig.icon}
      />

      <StatusOrderDetailsCard order={order} />
      <StatusOrderItemsCard order={order} />

      <Typography as="p" variant="muted" className="pb-8 text-center text-xs">
        &copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
        <br />
        Contact us at {siteConfig.contact.phone} for any concerns.
      </Typography>
    </StatusPageFrame>
  );
}
