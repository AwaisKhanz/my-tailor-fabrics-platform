"use client";

import React from "react";
import { useParams } from "next/navigation";
import { BranchHubConfig } from "@/components/config/BranchHubConfig";

export default function BranchHubPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="">
      <BranchHubConfig branchId={id} />
    </div>
  );
}
