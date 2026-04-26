'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, MessageCircle } from 'lucide-react';
import { Button } from '@tbms/ui/components/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@tbms/ui/components/sheet';
import { siteConfig } from '@/lib/config';
import { getPublicPortalBaseUrl } from '@/lib/env';
import { marketingNavItems } from '@/lib/marketing-content';
import { cn } from '@/lib/utils';

const primaryLinkClass =
  'inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80';

const secondaryLinkClass =
  'inline-flex h-9 items-center justify-center gap-1.5 rounded-full border border-border bg-background px-6 text-sm font-medium text-foreground transition-colors hover:bg-muted';

function resolveLinkHref(pathname: string, href: string) {
  if (pathname.startsWith('/site')) {
    return href === '/' ? '/site' : `/site${href}`;
  }

  return href;
}

function isActive(pathname: string, href: string) {
  const normalizedPath = pathname.startsWith('/site')
    ? pathname.slice('/site'.length) || '/'
    : pathname;

  if (href === '/') {
    return normalizedPath === '/';
  }

  return normalizedPath === href || normalizedPath.startsWith(`${href}/`);
}

export function MarketingShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const portalLink = `${getPublicPortalBaseUrl()}/login`;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
          <Link href={resolveLinkHref(pathname, '/')} className="inline-flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-sm font-semibold text-primary-foreground">
              MT
            </div>
            <div>
              <p className="text-base font-semibold tracking-[0.02em]">{siteConfig.name}</p>
              <p className="text-[0.68rem] uppercase tracking-[0.28em] text-muted-foreground">Tailoring studio</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 lg:flex">
            {marketingNavItems.map((item) => (
              <Link
                key={item.href}
                href={resolveLinkHref(pathname, item.href)}
                className={cn(
                  'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                  isActive(pathname, item.href)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <Link href={portalLink} className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Portal Login
            </Link>
            <Link href={siteConfig.contactAction.href} className={primaryLinkClass}>
              {siteConfig.contactAction.label}
            </Link>
          </div>

          <Sheet>
            <SheetTrigger render={<Button variant="outline" size="icon-lg" className="lg:hidden" />}>
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open navigation</span>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-sm">
              <SheetHeader>
                <SheetTitle>{siteConfig.name}</SheetTitle>
                <SheetDescription>Premium tailoring and direct consultation.</SheetDescription>
              </SheetHeader>
              <div className="flex flex-col gap-3 px-4 pb-6">
                {marketingNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={resolveLinkHref(pathname, item.href)}
                    className={cn(
                      'flex rounded-2xl border px-4 py-3 text-sm font-medium transition-colors',
                      isActive(pathname, item.href)
                        ? 'border-primary/30 bg-primary/10 text-primary'
                        : 'border-border/70 bg-card text-foreground hover:bg-muted',
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="grid gap-3 pt-4">
                  <Link href={siteConfig.contactAction.href} className={cn(primaryLinkClass, 'w-full')}>
                    {siteConfig.contactAction.label}
                  </Link>
                  <Link href={portalLink} className={cn(secondaryLinkClass, 'w-full')}>
                    Portal Login
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <main>{children}</main>

      <footer className="border-t border-border/70 bg-muted/30">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 pb-24 pt-10 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8 lg:pb-10">
          <div className="flex flex-col gap-3">
            <p className="text-2xl font-semibold tracking-tight">My Tailor & Fabrics</p>
            <p className="max-w-md text-sm leading-7 text-muted-foreground">
              Bespoke tailoring, guided fittings, and refined finishing for garments that feel personal.
            </p>
          </div>

          <div className="flex flex-col gap-3 lg:items-end">
            <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-muted-foreground">Explore</h3>
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm lg:justify-end">
              {marketingNavItems.map((item) => (
                <Link key={item.href} href={resolveLinkHref(pathname, item.href)} className="text-foreground/90 transition-colors hover:text-primary">
                  {item.label}
                </Link>
              ))}
              <Link href={portalLink} className="text-foreground/90 transition-colors hover:text-primary">
                Portal Login
              </Link>
            </div>
          </div>
        </div>
      </footer>

      <div className="fixed inset-x-4 bottom-4 z-40 lg:hidden">
        <Link href={siteConfig.contactAction.href} className={cn(primaryLinkClass, 'w-full shadow-lg')}>
          <MessageCircle className="h-4 w-4" />
          {siteConfig.contactAction.label}
        </Link>
      </div>
    </div>
  );
}
