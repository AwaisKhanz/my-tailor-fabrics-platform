import { create } from 'zustand';
import {
  readActiveBranchCookie,
  writeActiveBranchCookie,
} from '@/lib/branch-context';

interface Branch {
  id: string;
  name: string;
  code: string;
}

interface BranchState {
  activeBranchId: string | null;
  availableBranches: Branch[];
  setActiveBranch: (branchId: string) => void;
  setAvailableBranches: (branches: Branch[]) => void;
  hydrate: () => void;
}

export const useBranchStore = create<BranchState>((set) => ({
  activeBranchId: null,
  availableBranches: [],

  setActiveBranch: (branchId: string) => {
    writeActiveBranchCookie(branchId);
    set({ activeBranchId: branchId });
  },

  setAvailableBranches: (branches: Branch[]) => {
    set({ availableBranches: branches });
  },

  hydrate: () => {
    const savedBranchId = readActiveBranchCookie();
    if (savedBranchId) {
      set({ activeBranchId: savedBranchId });
    }
  },
}));
