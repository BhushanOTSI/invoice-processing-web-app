import { Header } from "@/components/layout/Header";
import { FAQSection } from "@/components/sections/FAQSection";
import { FeaturesSection } from "@/components/sections/FeaturesSection";
import { HeroSection } from "@/components/sections/HeroSection";
import { IntegrationsSection } from "@/components/sections/IntegrationsSection";
import { PricingSection } from "@/components/sections/PricingSection";

export const SECTIONS_CONFIG = [
    { Component: HeroSection, id: "hero" },
    { Component: FeaturesSection, id: "features" },
    { Component: IntegrationsSection, id: "integrations" },
    { Component: PricingSection, id: "pricing" },
    { Component: FAQSection, id: "faq" },
  
];

export const LandingLayout = ({ children }) => (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#8AB2FF0D] dark:from-gray-900 dark:to-gray-800">
        <Header />
        {children}
    </div>
);

export const SectionRenderer = ({ sections = SECTIONS_CONFIG }) => (
    <>
        {sections.map(({ Component, className }, index) => (
            <div key={index} className={className || ""}>
                <Component />
            </div>
        ))}
    </>
);