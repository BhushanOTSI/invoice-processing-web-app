"use client";

import * as React from "react";
import { LayoutDashboard, MonitorIcon, PlusIcon } from "lucide-react";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { LogoOTS } from "./logos";
import { APP_ROUTES } from "@/app/constants/app-routes";
import Link from "next/link";
import { useUser } from "@/hooks/use-user";

export function AppSidebar({ ...props }) {
  const { user } = useUser();

  const data = React.useMemo(
    () => ({
      user,
      navMain: [
        {
          title: "Dashboard",
          url: APP_ROUTES.DASHBOARD,
          icon: LayoutDashboard,
        },
        {
          title: "New Processing",
          url: APP_ROUTES.PROCESSING.NEW,
          icon: PlusIcon,
        },
        {
          title: "Monitor",
          icon: MonitorIcon,
          isActive: true,
          items: [
            {
              title: "Traces",
              url: APP_ROUTES.PROCESSING.TRACE,
            },
            {
              title: "Batches",
              url: APP_ROUTES.PROCESSING.MONITOR_BATCHES,
            },
          ],
        },
      ],
    }),
    [user.name]
  );

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="overflow-hidden">
          <Link href={APP_ROUTES.DASHBOARD}>
            <LogoOTS className="w-24 group-data-[collapsible=icon]:w-20 group-data-[collapsible=icon]:m-0.5 transition-all duration-200 ease-linear m-auto mt-2" />
          </Link>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
