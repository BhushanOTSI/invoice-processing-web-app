"use client";

import * as React from "react";
import { Bot, LayoutDashboard } from "lucide-react";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { LogoOTS } from "./logos";
import { APP_ROUTES } from "@/app/constants/app-routes";

export function AppSidebar({ ...props }) {
  const { setOpen } = useSidebar();
  const [username, setUsername] = React.useState("Invoice Processing");

  React.useEffect(() => {
    const savedName = localStorage.getItem("username");
    if (savedName) setUsername(savedName);
  }, []);

  const data = React.useMemo(
    () => ({
      user: {
        name: username,
      },
      navMain: [
        {
          title: "Dashboard",
          url: APP_ROUTES.DASHBOARD,
          icon: LayoutDashboard,
        },
        {
          title: "Processing",
          icon: Bot,
          isActive: true,
          items: [
            {
              title: "+ New Processing",
              url: APP_ROUTES.PROCESSING.NEW,
            },
            {
              title: "Monitor Traces",
              url: APP_ROUTES.PROCESSING.TRACE,
            },
          ],
        },
      ],
    }),
    [username]
  );

  return (
    <Sidebar
      collapsible="icon"
      {...props}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <SidebarHeader>
        <div className="overflow-hidden">
          <LogoOTS className="w-24 group-data-[collapsible=icon]:w-20 group-data-[collapsible=icon]:m-0.5 transition-[width] duration-200 ease-linear" />
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
