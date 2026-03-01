"use client";

import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { Role } from "@tbms/shared-types";
import { useBranchStore } from "@/store/useBranchStore";
import { api } from "@/lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Cookies from "js-cookie";

export function BranchSelector() {
  const { data: session } = useSession();
  const user = session?.user;
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
    if (user?.role === Role.SUPER_ADMIN && availableBranches.length === 0) {
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
          console.error("Failed to fetch branches:", error);
        }
      };
      fetchBranches();
    }
  }, [user, availableBranches.length, setAvailableBranches, setActiveBranch]);

  if (user?.role !== Role.SUPER_ADMIN) return null;

  return (
    <div className="flex items-center gap-2">
      <Select 
        value={activeBranchId || undefined} 
        onValueChange={(val) => {
          setActiveBranch(val);
          // Stripe-style global application reset on account/branch change
          if (typeof window !== 'undefined') {
            window.location.reload();
          }
        }}
      >
        <SelectTrigger variant="premium" className="w-[180px] h-9">
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
    </div>
  );
}
