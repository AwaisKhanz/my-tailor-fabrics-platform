import { type LucideIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@tbms/ui/components/button";
import { Card, CardContent } from "@tbms/ui/components/card";
import { PageSection, PageShell } from "@tbms/ui/components/page-shell";

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
    <PageShell width="narrow" viewport="screenRoomy" className="bg-background">
      <PageSection as="main" layout="center">
        <Card className="rounded-3xl">
          <CardContent className="space-y-6 px-8 py-10 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl border border-destructive/20 bg-destructive/10">
              <Icon className="h-10 w-10 text-destructive" />
            </div>

            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
            <p className="mx-auto max-w-[440px] text-sm text-muted-foreground sm:text-base">
              {description}
            </p>

            <div className="flex w-full flex-col gap-2 pt-2 sm:flex-row sm:justify-center">
              {actions.map((action) => (
                <Button
                  key={action.href}
                  variant={action.variant ?? "default"}
                  className="w-full sm:w-auto"
                  render={<Link href={action.href} />}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </PageSection>
    </PageShell>
  );
}
