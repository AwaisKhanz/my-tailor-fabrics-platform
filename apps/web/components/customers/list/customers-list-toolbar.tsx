import { RotateCcw, Search } from "lucide-react";
import { CustomerStatus } from "@tbms/shared-types";
import { CUSTOMER_STATUS_LABELS } from "@tbms/shared-constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Typography } from "@/components/ui/typography";
import { type CustomerStatusTab } from "@/hooks/use-customers-page";

const STATUS_TABS: { key: CustomerStatusTab; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: CustomerStatus.ACTIVE, label: CUSTOMER_STATUS_LABELS[CustomerStatus.ACTIVE] },
  { key: CustomerStatus.INACTIVE, label: CUSTOMER_STATUS_LABELS[CustomerStatus.INACTIVE] },
  { key: CustomerStatus.BLACKLISTED, label: CUSTOMER_STATUS_LABELS[CustomerStatus.BLACKLISTED] },
];

interface CustomersListToolbarProps {
  total: number;
  search: string;
  statusTab: CustomerStatusTab;
  hasActiveFilters: boolean;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: CustomerStatusTab) => void;
  onReset: () => void;
}

export function CustomersListToolbar({
  total,
  search,
  statusTab,
  hasActiveFilters,
  onSearchChange,
  onStatusChange,
  onReset,
}: CustomersListToolbarProps) {
  return (
    <div className="border-b border-border/50 bg-muted/5 px-6 py-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <Typography as="h2" variant="sectionTitle">
            Client Directory
          </Typography>
          <Badge variant="secondary" size="xs" className="ring-1 ring-border">
            {total} results
          </Badge>
        </div>

        <div className="flex flex-col items-center gap-3 md:flex-row">
          <div className="group relative w-full md:w-72">
            <Input
              placeholder="Name, phone, size..."
              variant="premium"
              className="h-10 bg-background pl-9"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
            />
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-hover:text-primary" />
          </div>

          <div className="w-full md:w-44">
            <Select value={statusTab} onValueChange={(value) => onStatusChange(value as CustomerStatusTab)}>
              <SelectTrigger className="h-10 border-border bg-background text-xs font-bold shadow-none">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_TABS.map((tab) => (
                  <SelectItem key={tab.key} value={tab.key} className="text-xs font-medium">
                    {tab.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="h-10 text-xs font-bold text-muted-foreground hover:text-foreground"
            onClick={onReset}
            disabled={!hasActiveFilters}
          >
            <RotateCcw className="mr-2 h-3.5 w-3.5" />
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}
