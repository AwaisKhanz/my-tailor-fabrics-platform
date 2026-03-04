"use client";

import React from "react";
import { useParams } from "next/navigation";
import { MeasurementCategoryDetail } from "@/components/config/MeasurementCategoryDetail";
import { withRoleGuard } from "@/components/auth/with-role-guard";

function MeasurementDetailPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <MeasurementCategoryDetail id={id} />
  );
}

export default withRoleGuard(MeasurementDetailPage, {
  all: ["settings.read", "measurements.read"],
});
