"use client";

import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  LogOut,
  Moon,
  Sun,
  UserCircle2,
} from "lucide-react";
import { siteConfig } from "@/lib/config";
import { useAuthz } from "@/hooks/use-authz";
import { getVisibleNavSections } from "@/lib/sidebar-navigation";
import { BranchSelector } from "@/components/layout/BranchSelector";
import { useTheme } from "@/components/ThemeProvider";
import { useBranchStore } from "@/store/useBranchStore";
import { clearSuperAdminBranchSelectionConfirmed } from "@/lib/branch-context";
import { HOME_ROUTE } from "@/lib/auth-routes";
import { USERS_SETTINGS_ROUTE } from "@/lib/settings-routes";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@tbms/ui/components/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@tbms/ui/components/dropdown-menu";
import { Label } from "@tbms/ui/components/label";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@tbms/ui/components/sidebar";
import { PERMISSION } from "@tbms/shared-constants";
import { Button } from "@tbms/ui/components/button";
import { Card } from "@tbms/ui/components/card";

function SidebarUserMenu() {
  const router = useRouter();
  const { data: session } = useSession();
  const { canAll } = useAuthz();
  const { theme, setTheme } = useTheme();
  const { clearActiveBranch } = useBranchStore();
  const canAccessSettings = canAll([PERMISSION["users.manage"]]);
  const user = session?.user;
  const initials = (user?.name ?? user?.email ?? "U").slice(0, 1).toUpperCase();
  const isDark = theme === "dark";

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                type="button"
                size="lg"
                className="cursor-pointer hover:bg-transparent hover:text-sidebar-accent-foreground active:bg-transparent active:text-transparent"
              />
            }
          >
            <Avatar size="sm" className="rounded-lg">
              <AvatarImage src="" alt={user?.name ?? "User"} />
              <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">
                {user?.name ?? "My Tailor & Fabrics"}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {user?.email ?? "Workspace user"}
              </span>
            </div>
            <ChevronDown className="ml-auto h-4 w-4 text-muted-foreground transition-transform group-data-popup-open]/menu-button:rotate-180" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Account</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => router.push(HOME_ROUTE)}>
                <UserCircle2 className="mr-2 h-4 w-4" />
                My Dashboard
              </DropdownMenuItem>
              {canAccessSettings ? (
                <DropdownMenuItem
                  onClick={() => router.push(USERS_SETTINGS_ROUTE)}
                >
                  Staff Accounts
                </DropdownMenuItem>
              ) : null}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel>Appearance</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => setTheme("light")}
                className="justify-between"
              >
                <span className="inline-flex items-center gap-2">
                  <Sun className="h-4 w-4" />
                  Light
                </span>
                {!isDark ? <Check className="h-4 w-4 text-primary" /> : null}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTheme("dark")}
                className="justify-between"
              >
                <span className="inline-flex items-center gap-2">
                  <Moon className="h-4 w-4" />
                  Dark
                </span>
                {isDark ? <Check className="h-4 w-4 text-primary" /> : null}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:bg-destructive/10 focus:text-destructive"
              onClick={() => {
                clearActiveBranch();
                clearSuperAdminBranchSelectionConfirmed();
                void signOut();
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter();
  const pathname = usePathname();
  const { role, canAll } = useAuthz();
  const sections = useMemo(() => getVisibleNavSections(role), [role]);
  const canSwitchBranch = canAll([PERMISSION["branch.switch"]]);
  const sectionHasActivePath = useMemo(
    () =>
      sections.reduce<Record<string, boolean>>((accumulator, section) => {
        const isActive = section.items.some(
          (item) =>
            pathname === item.href ||
            (item.href !== HOME_ROUTE && pathname.startsWith(`${item.href}/`)),
        );
        accumulator[section.title] = isActive;
        return accumulator;
      }, {}),
    [pathname, sections],
  );
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setOpenSections((current) => {
      const next: Record<string, boolean> = {};
      sections.forEach((section, index) => {
        const existing = current[section.title];
        const hasActivePath = sectionHasActivePath[section.title] || false;
        next[section.title] =
          typeof existing === "boolean"
            ? existing || hasActivePath
            : hasActivePath || index === 0;
      });

      const currentKeys = Object.keys(current);
      const nextKeys = Object.keys(next);
      if (
        currentKeys.length === nextKeys.length &&
        nextKeys.every((key) => current[key] === next[key])
      ) {
        return current;
      }

      return next;
    });
  }, [sectionHasActivePath, sections]);

  return (
    <Sidebar collapsible="offcanvas" variant="card" {...props}>
      <Card
        onClick={() => router.push(HOME_ROUTE)}
        className="p-3 rounded-b-none border-none"
      >
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="truncate text-xs font-semibold uppercase tracking-wider ">
            Workspace
          </span>
          <span className="truncate text-base font-semibold">
            {siteConfig.shortName}
          </span>
        </div>

        {canSwitchBranch ? (
          <div className=" w-full min-w-0 rounded-lg">
            <Label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-shadow-primary-foreground">
              Active Branch
            </Label>
            <BranchSelector className="h-10 text-sm w-full" />
          </div>
        ) : null}
      </Card>

      <SidebarContent className="px-1 pb-1">
        {sections.map((section) => (
          <SidebarGroup key={section.title} className="p-1">
            <SidebarGroupLabel
              render={
                <Button
                  type="button"
                  onClick={() =>
                    setOpenSections((current) => ({
                      ...current,
                      [section.title]: !current[section.title],
                    }))
                  }
                />
              }
              className={`h-10 cursor-pointer justify-between rounded-lg px-2 text-[11px] uppercase tracking-wide bg-transparent ${openSections[section.title] ? "text-primary" : "text-muted-foreground"}`}
            >
              <span>{section.title}</span>
              <ChevronDown
                className={`h-3.5 w-3.5 shrink-0 transition-transform ${
                  openSections[section.title] ? "rotate-0" : "-rotate-90"
                }`}
              />
            </SidebarGroupLabel>
            {openSections[section.title] ? (
              <SidebarGroupContent>
                <SidebarMenu>
                  {section.items.map((item) => {
                    const ItemIcon = item.icon;
                    const isActive =
                      pathname === item.href ||
                      (item.href !== HOME_ROUTE &&
                        pathname.startsWith(`${item.href}/`));

                    return (
                      <SidebarMenuItem
                        key={item.href}
                        className="my-1  rounded-lg"
                      >
                        <SidebarMenuButton
                          size={"lg"}
                          isActive={isActive}
                          onClick={() => router.push(item.href)}
                          className="sh-10 rounded-lg px-2.5 cursor-pointer"
                        >
                          <ItemIcon />
                          <span>{item.title}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            ) : null}
          </SidebarGroup>
        ))}
      </SidebarContent>

      <Card className=" rounded-t-none border-none">
        <SidebarUserMenu />
      </Card>
    </Sidebar>
  );
}
