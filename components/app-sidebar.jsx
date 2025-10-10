"use client";

import * as React from "react";
import { BookOpen, Bot, LayoutDashboard } from "lucide-react";

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

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
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
      items: [
        {
          title: "New Processing",
          url: APP_ROUTES.PROCESSING.NEW,
        },
        {
          title: "Trace's",
          url: APP_ROUTES.PROCESSING.TRACE,
        },
      ],
    },
    {
      title: "Documentation",
      icon: BookOpen,
      items: [
        {
          title: "Introduction",
          url: APP_ROUTES.DOCUMENTATION.INTRODUCTION,
        },
        {
          title: "Get Started",
          url: APP_ROUTES.DOCUMENTATION.GET_STARTED,
        },
        {
          title: "Tutorials",
          url: APP_ROUTES.DOCUMENTATION.TUTORIALS,
        },
        {
          title: "Changelog",
          url: APP_ROUTES.DOCUMENTATION.CHANGELOG,
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="overflow-hidden">
          <LogoOTS
            className={
              "w-24 group-data-[collapsible=icon]:w-20  group-data-[collapsible=icon]:m-0.5 transition-[width] duration-200 ease-linear"
            }
          />
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
