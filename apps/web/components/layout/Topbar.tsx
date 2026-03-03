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
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between overflow-hidden border-b bg-card/95 px-3 shadow-sm backdrop-blur sm:px-4 lg:h-[72px] lg:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-2 lg:flex-[0_0_30%] lg:gap-3">
        <MobileSidebarTrigger />
        <div className="min-w-0">
          <BranchSelector />
        </div>
      </div>

      <div className="hidden flex-1 items-center justify-center px-4 lg:flex">
        <div className="relative w-full max-w-xl">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            variant="premium"
            placeholder="Search orders, customers..."
            className="h-10 w-full pl-10"
          />
        </div>
      </div>

      <div className="flex flex-1 items-center justify-end gap-2 lg:flex-[0_0_30%] lg:gap-3">
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-10 w-10 overflow-hidden rounded-full p-0 ring-1 ring-border transition-all hover:ring-primary/30"
            >
              <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary font-bold text-sm">
                {(user?.email || "U")[0].toUpperCase()}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1 p-2">
                <p className="text-sm font-bold leading-none text-foreground">{user?.email || "User Account"}</p>
                <Label variant="dashboard">
                  {role?.replace("_", " ") || "Member"}
                </Label>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {canAccessSettings && (
              <DropdownMenuItem asChild className="cursor-pointer py-2.5 px-3">
                <Link href="/settings/users">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile Settings</span>
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem asChild className="cursor-pointer py-2.5 px-3">
              <Link href="/">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>Personal Dashboard</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer py-2.5 px-3 text-destructive focus:text-destructive focus:bg-destructive/5"
              onClick={() => signOut()}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
