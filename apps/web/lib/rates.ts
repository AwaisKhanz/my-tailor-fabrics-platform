export const RATE_CARD_GLOBAL_BRANCH_VALUE = "GLOBAL";

export interface RateBranchScopeOption {
  value: string;
  label: string;
}

interface RateBranchScopeSource {
  id: string;
  name: string;
  code: string;
}

export function buildRateBranchScopeOptions(
  branches: RateBranchScopeSource[],
): RateBranchScopeOption[] {
  return [
    {
      value: RATE_CARD_GLOBAL_BRANCH_VALUE,
      label: "Global (All Branches)",
    },
    ...branches.map((branch) => ({
      value: branch.id,
      label: `${branch.name} (${branch.code})`,
    })),
  ];
}
