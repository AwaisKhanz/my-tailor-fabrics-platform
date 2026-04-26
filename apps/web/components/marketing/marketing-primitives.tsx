import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { Badge } from '@tbms/ui/components/badge';
import { Button } from '@tbms/ui/components/button';
import { cn } from '@/lib/utils';
import { siteConfig } from '@/lib/config';

export function MarketingSection({
  id,
  className,
  children,
}: {
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={cn('py-14 sm:py-16 lg:py-20', className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
    </section>
  );
}

export function MarketingSectionHeader({
  eyebrow,
  title,
  description,
  align = 'left',
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
}) {
  return (
    <div className={cn('flex flex-col gap-4', align === 'center' && 'mx-auto max-w-3xl text-center')}>
      {eyebrow ? (
        <Badge
          variant="outline"
          className={cn(
            'w-fit rounded-full px-3 py-1 text-[0.68rem] uppercase tracking-[0.24em]',
            align === 'center' && 'mx-auto',
          )}
        >
          {eyebrow}
        </Badge>
      ) : null}
      <div className="flex flex-col gap-3">
        <h2 className="max-w-3xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {title}
        </h2>
        {description ? (
          <p className="max-w-2xl text-base leading-7 text-muted-foreground">{description}</p>
        ) : null}
      </div>
    </div>
  );
}

export function MarketingCtaButtons({ compact = false }: { compact?: boolean }) {
  return (
    <div className={cn('flex flex-col gap-3 sm:flex-row', compact && 'sm:flex-col lg:flex-row')}>
      <Button size="lg" className="rounded-full px-7" render={<Link href={siteConfig.contactAction.href} />}>
        <MessageCircle className="h-4 w-4" />
        {siteConfig.contactAction.label}
      </Button>
      <Button size="lg" variant="outline" className="rounded-full px-7" render={<Link href="/#services" />}>
        View Services
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
