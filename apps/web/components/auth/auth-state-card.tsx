import { type LucideIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageSection, PageShell } from "@/components/ui/page-shell";
import { Heading, Text } from "@/components/ui/typography";

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
      <PageSection spacing="compact" className="relative w-full max-w-xl">
        <Card className="rounded-[32px]">
          <CardContent
            spacing="section"
            className="space-y-6 px-8 py-10 text-center"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[20px] border border-destructive/20 bg-destructive/10">
              <Icon className="h-10 w-10 text-destructive" />
            </div>

            <Heading as="h1"  variant="page">
              {title}
            </Heading>
            <Text as="p"  variant="lead" className="mx-auto max-w-[440px]">
              {description}
            </Text>

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
