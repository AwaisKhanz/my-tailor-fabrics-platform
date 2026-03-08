"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useBranchStore } from "@/store/useBranchStore";
import { branchesApi } from "@/lib/api/branches";
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
import { PERMISSION } from '@tbms/shared-constants';

interface BranchSelectorProps {
  className?: string;
}

export function BranchSelector({ className }: BranchSelectorProps) {
  const router = useRouter();
  const { canAll } = useAuthz();
  const canSwitchBranch = canAll([PERMISSION["branch.switch"]]);
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
          const response = await branchesApi.getActiveBranchesForSwitcher();
          if (response.success) {
            setAvailableBranches(response.data);

            // Auto-select first branch if none selected
            const savedBranchId = Cookies.get("tbms_active_branch");
            if (!savedBranchId && response.data.length > 0) {
              setActiveBranch(response.data[0].id);
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
          "h-10 w-full text-snow-14 font-semibold",
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
