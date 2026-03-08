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
import { PERMISSION } from '@tbms/shared-constants';

export function Topbar() {
  const { data: session } = useSession();
  const { canAll } = useAuthz();
  const user = session?.user;
  const role = user?.role;
  const canAccessSettings = canAll([PERMISSION["users.manage"]]);

  return (
    <header className="fixed inset-x-0 top-0 z-40 px-3 pt-3 sm:px-4 lg:px-5 text-primary-foreground">
      <div className="space-y-2">
        <div className="flex h-[4.5rem] w-full items-center gap-2 rounded-snow-28 border border-sidebar-border bg-sidebar px-3 shadow-sm sm:gap-3 sm:px-4 lg:px-5 ">
          <div className="flex min-w-0 items-center gap-2 md:pr-4">
            <MobileSidebarTrigger />
            <div className=" min-w-0 flex-col flex">
              <Label className="text-xs font-bold uppercase tracking-[0.08em] text-prmary-foreground ">
                Workspace
              </Label>
              <span className="truncate text-base font-semibold">
                {siteConfig.shortName}
              </span>
            </div>
          </div>

          <div className="hidden min-w-0 flex-1 items-center justify-center self-center md:flex">
            <GlobalSearchCommand className="w-full max-w-3xl" />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary">
                  <div className="">
                    {(user?.email || "U")[0].toUpperCase()}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col gap-1.5 p-2">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {user?.email || "User Account"}
                    </p>
                    <Label className="text-sm font-bold uppercase  text-muted-foreground">
                      {role?.replace("_", " ") || "Member"}
                    </Label>
                  </div>
                </DropdownMenuLabel>
                <div className="px-2 pb-2 empty:hidden">
                  <Label className="mb-1 block text-xs font-bold uppercase  text-muted-foreground">
                    Active Branch
                  </Label>
                  <BranchSelector className="h-8 text-xs" />
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
        <div className="md:hidden">
          <GlobalSearchCommand compact enableHotkeys={false} />
        </div>
      </div>
    </header>
  );
}
