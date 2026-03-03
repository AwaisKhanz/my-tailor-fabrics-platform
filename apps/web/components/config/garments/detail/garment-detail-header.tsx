import Link from "next/link";
import { ArrowLeft, Layout, Settings } from "lucide-react";
import { type GarmentTypeWithAnalytics } from "@tbms/shared-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";

interface GarmentDetailHeaderProps {
  garment: GarmentTypeWithAnalytics;
  onBack: () => void;
}

export function GarmentDetailHeader({ garment, onBack }: GarmentDetailHeaderProps) {
  return (
    <div className="flex items-start gap-4">
      <Button
        variant="tableIcon"
        size="iconSm"
        className="h-10 w-10 shrink-0 rounded-full"
        onClick={onBack}
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>

      <div className="flex-1">
        <PageHeader
          title={garment.name}
          description={
            <span className="inline-flex items-center gap-2">
              <Layout className="h-3 w-3" />
              Configuration & Pricing Model
            </span>
          }
          actions={
            <div className="flex items-center gap-2">
              <Badge variant={garment.isActive ? "success" : "outline"} size="xs">
                {garment.isActive ? "Active" : "Inactive"}
              </Badge>
              <Button asChild variant="outline" className="gap-2">
                <Link href="/settings/garments">
                  <Settings className="h-4 w-4" />
                  Manage Garments
                </Link>
              </Button>
            </div>
          }
        />
      </div>
    </div>
  );
}
