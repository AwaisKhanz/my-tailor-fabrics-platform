"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { LogOut, UserCircle2 } from "lucide-react";
import { siteConfig } from "@/lib/config";
import { useAuthz } from "@/hooks/use-authz";
import { getVisibleNavSections } from "@/lib/sidebar-navigation";
import { BranchSelector } from "@/components/layout/BranchSelector";
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
  DropdownMenuItem,
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

function SidebarUserMenu() {
  const { data: session } = useSession();
  const { canAll } = useAuthz();
  const canAccessSettings = canAll([PERMISSION["users.manage"]]);
  const user = session?.user;
  const initials = (user?.name ?? user?.email ?? "U").slice(0, 1).toUpperCase();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger render={<SidebarMenuButton size="lg" />}>
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
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuItem render={<Link href={HOME_ROUTE} />}>
              <UserCircle2 className="mr-2 h-4 w-4" />
              My Dashboard
            </DropdownMenuItem>
            {canAccessSettings ? (
              <DropdownMenuItem render={<Link href={USERS_SETTINGS_ROUTE} />}>
                Staff Accounts
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:bg-destructive/10 focus:text-destructive"
              onClick={() => signOut()}
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
  const pathname = usePathname();
  const { role, canAll } = useAuthz();
  const sections = getVisibleNavSections(role);
  const canSwitchBranch = canAll([PERMISSION["branch.switch"]]);

  return (
    <Sidebar collapsible="offcanvas" variant="sidebar" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href={HOME_ROUTE} />}>
              <div className="grid min-w-0 leading-tight">
                <span className="truncate text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Workspace
                </span>
                <span className="truncate text-base font-semibold">
                  {siteConfig.shortName}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {sections.map((section) => (
          <SidebarGroup key={section.title}>
            <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => {
                  const ItemIcon = item.icon;
                  const isActive =
                    pathname === item.href ||
                    (item.href !== HOME_ROUTE &&
                      pathname.startsWith(`${item.href}/`));

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        tooltip={item.title}
                        isActive={isActive}
                        render={<Link href={item.href} />}
                        size={"lg"}
                      >
                        <ItemIcon />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        {canSwitchBranch ? (
          <SidebarGroup className="mt-auto">
            <SidebarGroupLabel>Branch</SidebarGroupLabel>
            <SidebarGroupContent>
              <Label className="mb-2 text-xs text-muted-foreground">
                Active Branch
              </Label>
              <BranchSelector className="h-8 text-xs" />
            </SidebarGroupContent>
          </SidebarGroup>
        ) : null}
      </SidebarContent>

      <SidebarFooter>
        <SidebarUserMenu />
      </SidebarFooter>
    </Sidebar>
  );
}
