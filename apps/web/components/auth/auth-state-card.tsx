import { type LucideIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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
    <div className="flex h-screen w-full flex-col items-center justify-center space-y-4 px-4 text-center">
      <div className="rounded-full bg-destructive/10 p-6">
        <Icon className="h-12 w-12 text-destructive" />
      </div>

      <Typography as="h1" variant="pageTitle">
        {title}
      </Typography>
      <Typography as="p" variant="lead" className="max-w-[420px]">
        {description}
      </Typography>

      <div className="flex gap-2 pt-4">
        {actions.map((action) => (
          <Button key={action.href} asChild variant={action.variant ?? "default"}>
            <Link href={action.href}>{action.label}</Link>
          </Button>
        ))}
      </div>
    </div>
  );
}
