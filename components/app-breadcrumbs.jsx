"use client";

import { Breadcrumb } from "@/components/ui/breadcrumb";
import {
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { BreadcrumbItem } from "@/components/ui/breadcrumb";
import { BreadcrumbLink } from "@/components/ui/breadcrumb";
import { useBreadcrumb } from "@/app/providers/breadcrumb-provider";
import { Fragment } from "react";
import { cn } from "@/lib/utils";

export function AppBreadcrumbs() {
  const {
    state: { breadcrumb = [] },
  } = useBreadcrumb();

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumb.map((item, index) => {
          const isLast = index === breadcrumb.length - 1;
          return (
            <Fragment key={index}>
              <BreadcrumbItem
                className={cn(
                  "md:block",
                  isLast && "block",
                  !isLast && "hidden"
                )}
              >
                <BreadcrumbLink href={item.url || "#"}>
                  {item.title}
                </BreadcrumbLink>
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator className="hidden md:block" />}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
