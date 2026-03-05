import { type LucideIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageSection, PageShell } from "@/components/ui/page-shell";
import { Typography } from "@/components/ui/typography";

interface AuthStateAction {
  label: string;
  href: string;
  variant?: "default" | "outline";
}

interface AuthStateCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actions: AuthStateAction[];
}

export function AuthStateCard({
  icon: Icon,
  title,
  description,
  actions,
}: AuthStateCardProps) {
  return (
    <PageShell
      width="full"
      spacing="compact"
      inset="none"
      className="relative flex min-h-screen items-center justify-center bg-background px-4 py-8"
    >
      <div className="pointer-events-none absolute inset-0 bg-theme-radial-top" />
      <PageSection spacing="compact" className="relative w-full max-w-xl">
        <Card variant="elevatedPanel">
          <CardContent
            spacing="section"
            className="space-y-5 py-8 text-center sm:py-10"
          >
            <div className="mx-auto w-fit rounded-full bg-error-muted p-5">
              <Icon className="h-10 w-10 text-destructive" />
            </div>

            <Typography as="h1" variant="pageTitle">
              {title}
            </Typography>
            <Typography as="p" variant="lead" className="mx-auto max-w-[440px]">
              {description}
            </Typography>

            <div className="flex w-full flex-col gap-2 pt-2 sm:flex-row sm:justify-center">
              {actions.map((action) => (
                <Button
                  key={action.href}
                  asChild
                  variant={action.variant ?? "default"}
                  className="w-full sm:w-auto"
                >
                  <Link href={action.href}>{action.label}</Link>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </PageSection>
    </PageShell>
  );
}
