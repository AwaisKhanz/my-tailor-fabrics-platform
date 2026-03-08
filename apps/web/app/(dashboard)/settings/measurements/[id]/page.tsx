"use client";

import { useParams } from "next/navigation";
import { MeasurementCategoryDetail } from "@/components/config/MeasurementCategoryDetail";
import { withRoleGuard } from "@/components/auth/with-role-guard";
import { PERMISSION } from '@tbms/shared-constants';

function MeasurementDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  return <MeasurementCategoryDetail id={id} />;
}

export default withRoleGuard(MeasurementDetailPage, {
  all: [PERMISSION["settings.read"], PERMISSION["measurements.read"]],
});
