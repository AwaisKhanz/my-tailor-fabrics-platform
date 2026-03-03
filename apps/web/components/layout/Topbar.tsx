"use client";

import { useSession, signOut } from "next-auth/react";
import { ADMIN_ROLES } from "@tbms/shared-constants";
import { BranchSelector } from "./BranchSelector";
import { MobileSidebarTrigger } from "./Sidebar";
import { Search, LogOut, User, LayoutDashboard } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "./ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

export function Topbar() {
  const { data: session } = useSession();
  const user = session?.user;
  const role = user?.role;
  const canAccessSettings = role ? ADMIN_ROLES.includes(role) : false;

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/85">
      <div className="flex h-16 w-full items-center gap-3 px-3 sm:px-4 lg:px-6">
        <MobileSidebarTrigger />
        <div className="min-w-0 flex-1 md:flex-none">
          <BranchSelector />
        </div>

        <div className="hidden flex-1 items-center justify-center lg:flex">
          <div className="relative w-full max-w-2xl">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              variant="table"
              placeholder="Search orders, customers, and staff..."
              className="h-9 w-full border-border/70 bg-background/90 pl-10"
            />
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-lg border-border/80 p-0"
              >
                <div className="flex h-full w-full items-center justify-center rounded-[7px] bg-primary/10 text-sm font-bold text-primary">
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
                  <Label variant="dashboard">{role?.replace("_", " ") || "Member"}</Label>
                </div>
              </DropdownMenuLabel>
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
      <div className="border-t border-border/60 px-3 py-2 lg:hidden">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            variant="table"
            placeholder="Search orders, customers..."
            className="h-9 w-full border-border/70 bg-background/90 pl-10"
          />
        </div>
      </div>
    </header>
  );
}
