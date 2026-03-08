"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useBranchStore } from "@/store/useBranchStore";
import { api } from "@/lib/api";
import { logDevError } from "@/lib/logger";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Cookies from "js-cookie";
import { useAuthz } from "@/hooks/use-authz";
import { cn } from "@/lib/utils";

interface BranchSelectorProps {
  className?: string;
}

export function BranchSelector({ className }: BranchSelectorProps) {
  const router = useRouter();
  const { canAll } = useAuthz();
  const canSwitchBranch = canAll(["branch.switch"]);
  const {
    activeBranchId,
    availableBranches,
    setActiveBranch,
    setAvailableBranches,
    hydrate,
  } = useBranchStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (canSwitchBranch && availableBranches.length === 0) {
      const fetchBranches = async () => {
        try {
          const response = await api.get("/config/branches");
          if (response.data.success) {
            setAvailableBranches(response.data.data);

            // Auto-select first branch if none selected
            const savedBranchId = Cookies.get("tbms_active_branch");
            if (!savedBranchId && response.data.data.length > 0) {
              setActiveBranch(response.data.data[0].id);
            }
          }
        } catch (error) {
          logDevError("Failed to fetch branches:", error);
        }
      };
      fetchBranches();
    }
  }, [
    availableBranches.length,
    canSwitchBranch,
    setAvailableBranches,
    setActiveBranch,
  ]);

  if (!canSwitchBranch) return null;

  return (
    <Select
      value={activeBranchId || undefined}
      onValueChange={(val) => {
        setActiveBranch(val);
        router.refresh();
      }}
    >
      <SelectTrigger
        className={cn(
          "h-10 w-full text-sm font-semibold  sm:text-[0.875rem]",
          className,
        )}
      >
        <SelectValue placeholder="Select Branch" />
      </SelectTrigger>
      <SelectContent>
        {availableBranches.map((branch) => (
          <SelectItem key={branch.id} value={branch.id}>
            {branch.name} ({branch.code})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
