import { RotateCcw, Search, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Typography } from "@/components/ui/typography";

interface RatesSearchStatsProps {
  search: string;
  total: number;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
}

export function RatesSearchStats({
  search,
  total,
  onSearchChange,
  onClearSearch,
}: RatesSearchStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      <div className="md:col-span-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by step key or garment type..."
            className="border-border/50 bg-card pl-9"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>
      </div>

      <Card className="border-primary/10 bg-primary/[0.02]">
        <CardContent className="flex items-center justify-between p-4">
          <div>
            <Label variant="dashboard">Total Defined</Label>
            <Typography as="p" variant="statValue" className="text-xl">
              {total}
            </Typography>
          </div>
          <TrendingUp className="h-5 w-5 text-primary opacity-50" />
        </CardContent>
      </Card>

      <div className="md:col-span-4 flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          className="text-xs font-bold"
          onClick={onClearSearch}
          disabled={!search.trim()}
        >
          <RotateCcw className="mr-2 h-3.5 w-3.5" />
          Reset Search
        </Button>
      </div>
    </div>
  );
}
