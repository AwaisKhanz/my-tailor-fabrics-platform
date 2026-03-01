import { create } from 'zustand';
import Cookies from 'js-cookie';

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
    Cookies.set('tbms_active_branch', branchId, { expires: 7 });
    set({ activeBranchId: branchId });
  },

  setAvailableBranches: (branches: Branch[]) => {
    set({ availableBranches: branches });
  },

  hydrate: () => {
    const savedBranchId = Cookies.get('tbms_active_branch');
    if (savedBranchId) {
      set({ activeBranchId: savedBranchId });
    }
  },
}));
