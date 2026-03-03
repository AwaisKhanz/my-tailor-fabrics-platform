import Image from "next/image";
import { ShieldCheck, Sparkles, Workflow } from "lucide-react";
import { Typography } from "@/components/ui/typography";
import { siteConfig } from "@/lib/config";

export function LoginBrandPanel() {
  return (
    <aside className="relative flex h-full flex-col overflow-hidden border-b border-border/70 bg-brand-dark px-6 py-8 text-primary-foreground sm:px-8 lg:px-10 lg:py-12 md:border-b-0 md:border-r">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/35 via-background/70 to-background" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_45%)]" />

      <div className="relative z-10 mb-8 flex w-fit items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 backdrop-blur-sm">
        <div className="relative h-5 w-5 overflow-hidden rounded bg-white/20">
          <Image
            src={siteConfig.branding.logo}
            alt={siteConfig.name}
            fill
            className="object-contain p-0.5"
          />
        </div>
        <span className="text-sm font-bold tracking-tight">{siteConfig.shortName}</span>
      </div>

      <div className="relative z-10 space-y-4">
        <Typography as="h1" variant="pageTitle" className="text-3xl leading-tight text-primary-foreground sm:text-4xl lg:text-5xl">
          Command your
          <br />
          tailoring workflow.
        </Typography>
        <Typography as="p" variant="body" className="max-w-md text-sm leading-relaxed text-primary-foreground/90 sm:text-base">
          Unified orders, customers, fittings, and team operations in one clean workspace.
        </Typography>
      </div>

      <div className="relative z-10 mt-10 hidden space-y-4 border-t border-white/15 pt-6 md:block">
        <div className="flex items-center gap-2 text-sm text-primary-foreground/80">
          <ShieldCheck className="h-4 w-4 text-primary-foreground" />
          Enterprise-grade access control
        </div>
        <div className="flex items-center gap-2 text-sm text-primary-foreground/80">
          <Workflow className="h-4 w-4 text-primary-foreground" />
          Real-time operational visibility
        </div>
        <div className="flex items-center gap-2 text-sm text-primary-foreground/80">
          <Sparkles className="h-4 w-4 text-primary-foreground" />
          Built for production-focused teams
        </div>
      </div>
    </aside>
  );
}
