"use client";

import { cn } from "@/lib/utils";
import OtsiLogo from "@/public/logos/otsi.svg";
import IBMLogo from "@/public/logos/ibm.svg";
import tickMark from "@/public/tick-mark.svg";

export function LogoOTS({ className }) {
  return <OtsiLogo className={cn("dark:*:fill-white", className)} />;
}

export function LogoIBM({ className }) {
  return <IBMLogo className={cn("dark:*:fill-white!", className)} />;
}
export function logoTickMark({ className }) {
  return <tickMark className={cn("dark:*:fill-white!", className)} />;
}
