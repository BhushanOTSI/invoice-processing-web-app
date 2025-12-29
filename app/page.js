"use client";

import { LandingLayout, SectionRenderer, SECTIONS_CONFIG } from "@/lib/landing-config";
import { useScrollNavigation } from "@/hooks/use-scroll-navigation";

export default function LandingPage() {
    useScrollNavigation(SECTIONS_CONFIG);

    return (
        <LandingLayout>
            <SectionRenderer sections={SECTIONS_CONFIG} />
        </LandingLayout>
    );
}