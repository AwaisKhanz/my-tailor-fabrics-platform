import Image from "next/image";
import { ShieldCheck } from "lucide-react";
import { Typography } from "@/components/ui/typography";
import { siteConfig } from "@/lib/config";

export function LoginBrandPanel() {
  return (
    <div className="relative flex flex-col overflow-hidden bg-brand-dark p-8 text-primary-foreground md:w-1/2 md:justify-between md:p-12">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-primary/20 to-foreground/80" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_40%)]" />

      <div className="relative z-10 mb-6 flex w-fit items-center gap-2 rounded-lg border border-border/20 bg-primary-foreground/10 px-3 py-1.5 backdrop-blur-sm md:mb-0">
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

      <div className="relative z-10 space-y-3 md:-mt-10">
        <Typography as="h1" variant="pageTitle" className="text-2xl leading-tight text-primary-foreground md:text-5xl">
          Elevating Custom
          <br />
          Tailoring Standards.
        </Typography>
        <Typography as="p" variant="body" className="max-w-sm text-sm leading-relaxed text-primary-foreground/90 md:text-lg">
          Manage your bespoke business with industry-leading tools.
        </Typography>
      </div>

      <div className="relative z-10 mt-10 hidden items-center gap-2 border-t border-border/10 pt-6 text-sm font-medium text-primary-foreground/70 md:flex">
        <ShieldCheck className="h-4 w-4" />
        Enterprise Grade Security &amp; Role-Based Access
      </div>
    </div>
  );
}
