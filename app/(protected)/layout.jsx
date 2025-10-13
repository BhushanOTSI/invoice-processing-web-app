"use client";

import { useEffect } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { AppBreadcrumbs } from "@/components/app-breadcrumbs";
import { LogoIBM } from "@/components/logos";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { BaseAPI } from "@/services/api/baseAPI";
import { useRouter } from "next/navigation";
import { APP_ROUTES } from "@/app/constants/app-routes";

import BreadcrumbProvider from "@/app/providers/breadcrumb-provider";
import { isValidValue } from "@/lib/utils";

export default function ProtectedLayout({ children }) {
  const router = useRouter();

  useEffect(() => {
    const auth = BaseAPI.getAuthToken();

    if (!isValidValue(auth)) {
      router.push(APP_ROUTES.LOGIN);
    }
  }, []);

  return (
    <SidebarProvider defaultOpen={false}>
      <BreadcrumbProvider>
        <AppSidebar />
        <SidebarInset className={"flex flex-col overflow-x-hidden"}>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 justify-between border-b">
            <div className="flex items-center gap-2 px-6">
              {/* <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              /> */}
              <AppBreadcrumbs />
            </div>
            <div className={"flex items-center gap-4 pr-6"}>
              <ModeToggle />
              <LogoIBM className={"w-14 sm:w-18"} />
            </div>
          </header>
          <div className={"flex-1 flex flex-col"}>{children}</div>
        </SidebarInset>
      </BreadcrumbProvider>
    </SidebarProvider>
  );
}
