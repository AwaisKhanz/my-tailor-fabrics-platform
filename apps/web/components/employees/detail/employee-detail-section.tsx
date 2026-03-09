"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Text } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

export interface EmployeeSectionProps {
  id: string;
  title: string;
  description: string;
  badge?: ReactNode;
  action?: ReactNode;
  defaultOpen?: boolean;
  onFirstOpen?: () => void;
  children: ReactNode;
}

export function EmployeeSection({
  id,
  title,
  description,
  badge,
  action,
  defaultOpen = true,
  onFirstOpen,
  children,
}: EmployeeSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const openedRef = useRef(false);

  useEffect(() => {
    if (!defaultOpen || openedRef.current || !onFirstOpen) {
      return;
    }

    openedRef.current = true;
    onFirstOpen();
  }, [defaultOpen, onFirstOpen]);

  const handleToggle = () => {
    const next = !isOpen;
    setIsOpen(next);

    if (next && !openedRef.current && onFirstOpen) {
      openedRef.current = true;
      onFirstOpen();
    }
  };

  return (
    <Card id={id}>
      <CardHeader
        layout="rowBetweenResponsive"
        surface="mutedSection"
        trimBottom
      >
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>{title}</CardTitle>
            {badge}
          </div>
          <Text as="p" variant="muted">
            {description}
          </Text>
        </div>

        <div className="ml-auto flex w-full items-center justify-end gap-2 sm:w-auto">
          {action}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0"
            aria-expanded={isOpen}
            aria-controls={`${id}-content`}
            onClick={handleToggle}
          >
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                isOpen && "rotate-180",
              )}
            />
          </Button>
        </div>
      </CardHeader>

      {isOpen ? (
        <CardContent id={`${id}-content`} spacing="section" className="p-0">
          {children}
        </CardContent>
      ) : null}
    </Card>
  );
}
