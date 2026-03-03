"use client";

import { usePublicOrderStatusPage } from "@/hooks/use-public-order-status-page";
import { siteConfig } from "@/lib/config";
import { Typography } from "@/components/ui/typography";
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
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <StatusPinGateCard
          pin={pin}
          loading={loading}
          error={error}
          onPinChange={setPin}
          onSubmit={verifyPin}
        />
      </div>
    );
  }

  if (!order || !statusConfig) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-lg space-y-4 pt-8">
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
      </div>
    </div>
  );
}
