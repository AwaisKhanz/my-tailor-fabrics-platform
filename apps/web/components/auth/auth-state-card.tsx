import { type LucideIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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
      className="flex min-h-screen items-center justify-center px-4"
    >
      <PageSection spacing="compact" className="flex max-w-xl flex-col items-center text-center">
        <div className="rounded-full bg-destructive/10 p-6">
          <Icon className="h-12 w-12 text-destructive" />
        </div>

        <Typography as="h1" variant="pageTitle">
          {title}
        </Typography>
        <Typography as="p" variant="lead" className="max-w-[420px]">
          {description}
        </Typography>

        <div className="flex w-full flex-col gap-2 pt-4 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-center">
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
      </PageSection>
    </PageShell>
  );
}
