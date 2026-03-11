"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useBranchStore } from "@/store/useBranchStore";
import { logDevError } from "@/lib/logger";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@tbms/ui/components/select";
import { useAuthz } from "@/hooks/use-authz";
import { useBranchesSwitcher } from "@/hooks/queries/branch-queries";
import { readActiveBranchCookie } from "@/lib/branch-context";
import { cn } from "@/lib/utils";
import { PERMISSION } from "@tbms/shared-constants";

interface BranchSelectorProps {
  className?: string;
}

export function BranchSelector({ className }: BranchSelectorProps) {
  const router = useRouter();
  const { canAll } = useAuthz();
  const canSwitchBranch = canAll([PERMISSION["branch.switch"]]);
  const branchesSwitcherQuery = useBranchesSwitcher();
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
    if (
      canSwitchBranch &&
      availableBranches.length === 0 &&
      branchesSwitcherQuery.data?.success
    ) {
      setAvailableBranches(branchesSwitcherQuery.data.data);

      // Auto-select first branch if none selected
      const savedBranchId = readActiveBranchCookie();
      if (!savedBranchId && branchesSwitcherQuery.data.data.length > 0) {
        setActiveBranch(branchesSwitcherQuery.data.data[0].id);
      }
    }
  }, [
    availableBranches.length,
    branchesSwitcherQuery.data,
    canSwitchBranch,
    setAvailableBranches,
    setActiveBranch,
  ]);

  useEffect(() => {
    if (!branchesSwitcherQuery.isError) {
      return;
    }

    logDevError("Failed to fetch branches:", branchesSwitcherQuery.error);
  }, [branchesSwitcherQuery.error, branchesSwitcherQuery.isError]);

  if (!canSwitchBranch) return null;

  return (
    <Select
      value={activeBranchId || undefined}
      onValueChange={(val) => {
        if (!val) {
          return;
        }
        setActiveBranch(val);
        router.refresh();
      }}
    >
      <SelectTrigger
        className={cn("h-10 w-full text-sm font-semibold", className)}
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
