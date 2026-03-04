import Image from "next/image";
import { ShieldCheck, Sparkles, Workflow } from "lucide-react";
import { InfoTile } from "@/components/ui/info-tile";
import { Typography } from "@/components/ui/typography";
import { siteConfig } from "@/lib/config";

export function LoginBrandPanel() {
  return (
    <aside className="relative flex h-full flex-col overflow-hidden border-b border-sidebar-border bg-brand-dark px-6 py-8 text-text-inverse sm:px-8 lg:px-10 lg:py-12 md:border-b-0 md:border-r">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-dark via-brand-dark to-primary/20" />
      <div className="absolute inset-0 bg-theme-radial-top opacity-60" />

      <InfoTile
        tone="inverseSoft"
        padding="sm"
        layout="row"
        className="relative z-10 mb-8 w-fit gap-2 backdrop-blur-sm"
      >
        <div className="relative h-5 w-5 overflow-hidden rounded bg-text-inverse/20">
          <Image
            src={siteConfig.branding.logo}
            alt={siteConfig.name}
            fill
            className="object-contain p-0.5"
          />
        </div>
        <span className="text-sm font-bold tracking-tight">{siteConfig.shortName}</span>
      </InfoTile>

      <div className="relative z-10 space-y-4">
        <Typography as="h1" variant="pageTitle" className="text-3xl leading-tight text-text-inverse sm:text-4xl lg:text-5xl">
          Command your
          <br />
          tailoring workflow.
        </Typography>
        <Typography as="p" variant="body" className="max-w-md text-sm leading-relaxed text-text-inverse/90 sm:text-base">
          Unified orders, customers, fittings, and team operations in one clean workspace.
        </Typography>
      </div>

      <div className="relative z-10 mt-10 hidden space-y-4 border-t border-text-inverse/15 pt-6 md:block">
        <div className="flex items-center gap-2 text-sm text-text-inverse/80">
          <ShieldCheck className="h-4 w-4 text-text-inverse" />
          Enterprise-grade access control
        </div>
        <div className="flex items-center gap-2 text-sm text-text-inverse/80">
          <Workflow className="h-4 w-4 text-text-inverse" />
          Real-time operational visibility
        </div>
        <div className="flex items-center gap-2 text-sm text-text-inverse/80">
          <Sparkles className="h-4 w-4 text-text-inverse" />
          Built for production-focused teams
        </div>
      </div>
    </aside>
  );
}
