import { LedgerEntryType, BadgeVariant } from '@tbms/shared-types';
/** Human-readable labels for each ledger entry type. */
export declare const LEDGER_ENTRY_TYPE_LABELS: Record<LedgerEntryType, string>;
export declare const LEDGER_ENTRY_TYPE_OPTIONS: {
    value: LedgerEntryType;
    label: string;
}[];
/** Badge variant for each entry type. */
export declare const LEDGER_ENTRY_TYPE_BADGE: Record<LedgerEntryType, BadgeVariant>;
/**
 * Sign of each entry type (positive = money in, negative = money out).
 * Use this to display +/- prefix in the UI.
 */
export declare const LEDGER_ENTRY_TYPE_SIGN: Record<LedgerEntryType, 1 | -1>;
