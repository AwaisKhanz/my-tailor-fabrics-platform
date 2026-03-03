"use client";

import { useSession, signOut } from "next-auth/react";
import { ADMIN_ROLES } from "@tbms/shared-constants";
import { BranchSelector } from "./BranchSelector";
import { MobileSidebarTrigger } from "./Sidebar";
import { 
  Search, 
  LogOut, 
  User, 
  LayoutDashboard
} from "lucide-react";
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
    <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between border-b bg-card px-2 md:px-6 shadow-sm overflow-hidden">
      
      {/* Left - Context (Branch) */}
      <div className="flex items-center gap-3 md:w-1/3">
        <MobileSidebarTrigger />
        <div className="flex items-center gap-2">
          <div className="font-bold text-lg text-foreground truncate max-w-[200px]">
            <BranchSelector />
          </div>
        </div>
      </div>

      {/* Middle - Global Search */}
      <div className="hidden md:flex items-center justify-center flex-1 max-w-xl px-4">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            variant="premium"
            placeholder="Search orders, customers..." 
            className="w-full pl-10"
          />
        </div>
      </div>

      {/* Right - Actions */}
      <div className="flex items-center justify-end gap-3 md:w-1/3">
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 overflow-hidden ring-1 ring-border hover:ring-primary/30 transition-all">
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
              <Link href="/settings/users">
                <DropdownMenuItem className="cursor-pointer py-2.5 px-3">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile Settings</span>
                </DropdownMenuItem>
              </Link>
            )}
            <Link href="/">
              <DropdownMenuItem className="cursor-pointer py-2.5 px-3">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>Personal Dashboard</span>
              </DropdownMenuItem>
            </Link>
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
