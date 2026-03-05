"use client";

import { useSession, signOut } from "next-auth/react";
import { BranchSelector } from "./BranchSelector";
import { MobileSidebarTrigger } from "./Sidebar";
import { LogOut, User, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "./ThemeToggle";
import { GlobalSearchCommand } from "./GlobalSearchCommand";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useAuthz } from "@/hooks/use-authz";
import { siteConfig } from "@/lib/config";

export function Topbar() {
  const { data: session } = useSession();
  const { canAll } = useAuthz();
  const user = session?.user;
  const role = user?.role;
  const canAccessSettings = canAll(["users.manage"]);

  return (
    <header className="sticky top-0 z-40 bg-background sm:bg-appBar text-appBar-foreground ">
      <div className="flex h-16 w-full items-center gap-2 px-3 sm:gap-3 sm:px-4 lg:px-6">
        <div className="flex min-w-0 items-center gap-2 md:pr-4">
          <MobileSidebarTrigger />
          <div className="hidden min-w-0 flex-col leading-tight md:flex">
            <Label
              variant="dashboard"
              className="text-[10px] uppercase tracking-[0.12em] text-appBar-foreground/50"
            >
              Workspace
            </Label>
            <span className="truncate text-sm font-semibold text-appBar-foreground">
              {siteConfig.shortName}
            </span>
          </div>
        </div>

        <div className="hidden min-w-0 flex-1 self-center justify-center items-center md:flex">
          <GlobalSearchCommand className="w-full max-w-3xl " />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="sidebarIcon" size="icon" className="h-9 w-9 p-0">
                <div className="flex h-full w-full items-center justify-center rounded-[7px] bg-sidebar-active text-sm font-bold text-appBar-foreground">
                  {(user?.email || "U")[0].toUpperCase()}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col gap-1.5 p-2">
                  <p className="truncate text-sm font-semibold text-text-primary">
                    {user?.email || "User Account"}
                  </p>
                  <Label variant="dashboard">
                    {role?.replace("_", " ") || "Member"}
                  </Label>
                </div>
              </DropdownMenuLabel>
              <div className="px-2 pb-2 empty:hidden">
                <Label
                  variant="dashboard"
                  className="mb-1 block text-[10px] uppercase tracking-[0.12em]"
                >
                  Active Branch
                </Label>
                <BranchSelector
                  triggerVariant="default"
                  className="h-8 text-xs"
                />
              </div>
              <DropdownMenuSeparator />
              {canAccessSettings && (
                <DropdownMenuItem asChild className="cursor-pointer py-2.5">
                  <Link href="/settings/users">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile Settings</span>
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem asChild className="cursor-pointer py-2.5">
                <Link href="/">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  <span>Personal Dashboard</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer py-2.5 text-destructive focus:bg-destructive/10 focus:text-destructive"
                onClick={() => signOut()}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="border-t border-sidebar-border px-3 py-2 md:hidden">
        <GlobalSearchCommand compact enableHotkeys={false} />
      </div>
    </header>
  );
}
