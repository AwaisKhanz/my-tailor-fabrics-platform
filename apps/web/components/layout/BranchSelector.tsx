"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
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
import {
  readActiveBranchCookie,
} from "@/lib/branch-context";
import { cn } from "@/lib/utils";
import { PERMISSION } from "@tbms/shared-constants";
import { Role } from "@tbms/shared-types";

interface BranchSelectorProps {
  className?: string;
}

export function BranchSelector({ className }: BranchSelectorProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const { canAll } = useAuthz();
  const canSwitchBranch = canAll([PERMISSION["branch.switch"]]);
  const branchesSwitcherQuery = useBranchesSwitcher();
  const {
    activeBranchId,
    availableBranches,
    setActiveBranch,
    clearActiveBranch,
    setAvailableBranches,
    hydrate,
  } = useBranchStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!canSwitchBranch || !branchesSwitcherQuery.data?.success) {
      return;
    }

    const fetchedBranches = branchesSwitcherQuery.data.data;
    setAvailableBranches(fetchedBranches);

    if (fetchedBranches.length === 0) {
      return;
    }

    const hasBranch = (branchId: string | null | undefined) =>
      Boolean(
        branchId && fetchedBranches.some((branch) => branch.id === branchId),
      );

    const sortedBranches = [...fetchedBranches].sort((a, b) =>
      a.name.localeCompare(b.name),
    );
    const mainBranch =
      fetchedBranches.find((branch) => branch.code.toUpperCase() === "MAIN") ??
      sortedBranches[0];

    const savedBranchId = readActiveBranchCookie();
    const sessionBranchId = session?.user?.branchId ?? null;
    const isSuperAdmin = session?.user?.role === Role.SUPER_ADMIN;
    const nextBranchId =
      (hasBranch(activeBranchId) ? activeBranchId : null) ||
      (hasBranch(savedBranchId) ? savedBranchId : null) ||
      (hasBranch(sessionBranchId) ? sessionBranchId : null) ||
      (isSuperAdmin ? null : mainBranch?.id);

    if (activeBranchId && !hasBranch(activeBranchId)) {
      clearActiveBranch();
    }

    if (nextBranchId && nextBranchId !== activeBranchId) {
      setActiveBranch(nextBranchId);
      router.refresh();
    }
  }, [
    activeBranchId,
    branchesSwitcherQuery.data,
    canSwitchBranch,
    clearActiveBranch,
    router,
    session?.user?.branchId,
    session?.user?.role,
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
  const selectedBranch =
    availableBranches.find((branch) => branch.id === activeBranchId) ?? null;

  return (
    <Select
      value={activeBranchId ?? null}
      onValueChange={(val) => {
        if (!val) {
          return;
        }
        setActiveBranch(val);
        void queryClient.invalidateQueries();
        router.refresh();
      }}
    >
      <SelectTrigger
        className={cn("h-10 w-full text-sm font-semibold", className)}
      >
        <SelectValue placeholder="Select Branch">
          {selectedBranch ? `${selectedBranch.name} (${selectedBranch.code})` : null}
        </SelectValue>
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
