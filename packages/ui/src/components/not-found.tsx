import * as React from "react";
import { CompassIcon, HomeIcon } from "lucide-react";
import { Button } from "@tbms/ui/components/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@tbms/ui/components/empty";

export interface NotFoundPageProps {
  homeHref?: string;
  homeLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}

export function NotFoundPage({
  homeHref = "#",
  homeLabel = "Go Home",
  secondaryHref,
  secondaryLabel = "Explore",
}: NotFoundPageProps) {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden">
      <Empty>
        <EmptyHeader>
          <EmptyTitle className="mask-b-from-20% mask-b-to-80% font-extrabold text-9xl">
            404
          </EmptyTitle>
          <EmptyDescription className="-mt-8 text-nowrap text-foreground/80">
            The page you&apos;re looking for might have been <br />
            moved or doesn&apos;t exist.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <div className="flex gap-2">
            <Button render={<a href={homeHref} />}>
              <HomeIcon data-icon="inline-start" />
              {homeLabel}
            </Button>
            <Button
              variant="outline"
              render={<a href={secondaryHref ?? "#"} />}
            >
              <CompassIcon data-icon="inline-start" />
              {secondaryLabel}
            </Button>
          </div>
        </EmptyContent>
      </Empty>
    </div>
  );
}
