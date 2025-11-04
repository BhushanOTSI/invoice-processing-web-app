"use client";

import Link from "next/link";
import { LogoOTS } from "./logos";
import { ModeToggle } from "./ui/mode-toggle";
import { UserAvatar } from "./nav-user";
import { useUser } from "@/hooks/use-user";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { LogOutIcon, ChevronDownIcon, LogInIcon } from "lucide-react";
import { Button } from "./ui/button";
import { APP_ROUTES } from "@/app/constants/app-routes";
import { Skeleton } from "./ui/skeleton";

export function NavTop() {
  const { user, logout, isLoggedIn, isMounted } = useUser();

  return (
    <header className="h-14 flex shrink-0 gap-2 transition-[width,height] ease-linear justify-between items-center px-8 ">
      <div>
        <Link href={"/"}>
          <LogoOTS className="w-20 group-data-[collapsible=icon]:w-20 group-data-[collapsible=icon]:m-0.5 transition-[width] duration-200 ease-linear" />
        </Link>
      </div>
      <div className="flex items-center gap-3">
        <ModeToggle />
        {!isMounted && <Skeleton className="w-18 h-6 rounded-full" />}
        {!isLoggedIn && isMounted && (
          <Button variant="secondary" className="rounded-full">
            <Link href={APP_ROUTES.LOGIN} className="flex items-center gap-2">
              <LogInIcon className="size-4" />
              Sign in
            </Link>
          </Button>
        )}
        {isLoggedIn && isMounted && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="!pl-0 py-0 rounded-full group/user-avatar"
              >
                <UserAvatar user={user} avatarOnly={true} />
                <ChevronDownIcon className="h-4 w-4 opacity-70 group-data-[state=open]/user-avatar:rotate-180 transition-transform duration-200 ease-linear" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" align="end" sideOffset={8}>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-3 px-3 py-3">
                  <UserAvatar user={user} />
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="cursor-pointer">
                <LogOutIcon className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
