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

export function BranchSelector() {
  const router = useRouter();
  const { canAll } = useAuthz();
  const canSwitchBranch = canAll(["branch.switch"]);
  const { 
    activeBranchId, 
    availableBranches, 
    setActiveBranch, 
    setAvailableBranches,
    hydrate 
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
            const savedBranchId = Cookies.get('tbms_active_branch');
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
  }, [availableBranches.length, canSwitchBranch, setAvailableBranches, setActiveBranch]);

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
        variant="appBar"
        className="h-9 w-[170px] text-xs font-semibold tracking-wide sm:w-[230px] sm:text-sm"
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
