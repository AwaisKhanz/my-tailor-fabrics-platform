"use client";

import * as React from "react";
import { Check, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@tbms/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@tbms/ui/components/dropdown-menu";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="secondary"
            className="relative"
            aria-label="Toggle theme"
          />
        }
      >
        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Color Mode</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => setTheme("light")}
            className={cn("justify-between", !isDark && "text-primary")}
          >
            <span>Light</span>
            {!isDark ? <Check className="h-4 w-4" /> : null}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setTheme("dark")}
            className={cn("justify-between", isDark && "text-primary")}
          >
            <span>Dark</span>
            {isDark ? <Check className="h-4 w-4" /> : null}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
