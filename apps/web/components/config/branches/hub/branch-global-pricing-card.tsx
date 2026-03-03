import Link from "next/link";
import { Shirt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";

export function BranchGlobalPricingCard() {
  return (
    <div className="mx-auto mt-10 max-w-2xl rounded-2xl border-2 border-dashed border-border bg-muted/30 p-6 text-center sm:mt-12 sm:p-10">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        <Shirt className="h-8 w-8 text-primary" />
      </div>
      <Typography as="h2" variant="sectionTitle" className="text-xl">
        Global Pricing Active
      </Typography>
      <Typography as="p" variant="lead" className="mx-auto mt-2 max-w-sm">
        This branch follows the company-wide pricing model. Individual branch overrides are no
        longer permitted.
      </Typography>
      <Button variant="premium" className="mt-8 w-full sm:w-auto" asChild>
        <Link href="/settings/garments">Manage Global Price List</Link>
      </Button>
    </div>
  );
}
