"use client";

import { ChevronsUpDown, LogOut } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useUser } from "@/hooks/use-user";
import { capitalize } from "remeda";

export function NavUser({ user }) {
  const { isMobile } = useSidebar();
  const { logout } = useUser();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="bg-sidebar-accent text-sidebar-accent-foreground"
            >
              <UserAvatar user={user} />
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <UserAvatar user={user} />
              </div>
            </DropdownMenuLabel>
            <DropdownMenuItem onClick={() => logout()}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

export function UserAvatar({ user, avatarOnly = false }) {
  return (
    <>
      <Avatar
        className={cn("h-8 w-8 rounded-lg", avatarOnly && "rounded-full")}
      >
        <AvatarImage src={user.avatar} alt={user.name} />
        <AvatarFallback
          className={cn("rounded-lg uppercase", avatarOnly && "rounded-full")}
        >
          {user.name.slice(0, 2)}
        </AvatarFallback>
      </Avatar>
      <div
        className={cn(
          "grid flex-1 text-left text-sm leading-tight",
          avatarOnly && "sr-only"
        )}
      >
        <span className="truncate font-medium">{capitalize(user.name)}</span>
      </div>
    </>
  );
}
