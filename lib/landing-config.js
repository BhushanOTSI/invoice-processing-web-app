import { Header } from "@/components/layout/Header";
import { FAQSection } from "@/components/sections/FAQSection";
import { FeaturesSection } from "@/components/sections/FeaturesSection";
import { FinalCTASection } from "@/components/sections/FinalCTASection";
import { FooterSection } from "@/components/sections/FooterSection";
import { HeroSection } from "@/components/sections/HeroSection";
import { IntegrationsSection } from "@/components/sections/IntegrationsSection";
import { PricingSection } from "@/components/sections/PricingSection";
import { StatsSection } from "@/components/sections/StatsSection";
import { WhyChooseSection } from "@/components/sections/WhyChooseSection";

export const SECTIONS_CONFIG = [
    { Component: HeroSection, id: "hero" },
    { Component: FeaturesSection, id: "features" },
    { Component: IntegrationsSection, id: "integrations" },
    { Component: StatsSection, id: "stats" },
    { Component: WhyChooseSection, id: "why-choose" },
    { Component: PricingSection, id: "pricing" },
    { Component: FAQSection, id: "faq" },
    { Component: FinalCTASection, id: "cta" },
    { Component: FooterSection, id: "footer" },
];

export const LandingLayout = ({ children }) => (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#8AB2FF0D] dark:from-gray-900 dark:to-gray-800">
        <Header />
        {children}
    </div>
);

export const SectionRenderer = ({ sections = SECTIONS_CONFIG }) => (
    <>
        {sections.map(({ Component, className, id }, index) => (
            <section key={id || index} id={id} className={className || ""}>
                <Component />
            </section>
        ))}
    </>
);