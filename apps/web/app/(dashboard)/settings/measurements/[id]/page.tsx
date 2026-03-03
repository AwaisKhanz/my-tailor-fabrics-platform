"use client";

import React from "react";
import { useParams } from "next/navigation";
import { MeasurementCategoryDetail } from "@/components/config/MeasurementCategoryDetail";

export default function MeasurementDetailPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <MeasurementCategoryDetail id={id} />
  );
}
