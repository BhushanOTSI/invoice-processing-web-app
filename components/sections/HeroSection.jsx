"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { InvoicePreviewSection } from "./InvoicePreviewSection";
// import { LandingInvoicePreview } from "../landing/invoice-preview";

const FeatureItem = ({ children }) => (
    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <div className="w-4 h-4 rounded-full bg-blue-500/30 flex items-center justify-center">
            <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
        </div>
        {children}
    </div>
);

export function HeroSection() {
    const router = useRouter();

    return (
        <section id="hero" className="py-6 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-10 lg:mb-14">
                    <Badge className="mb-6 lg:mb-8 px-4 py-2 text-sm font-medium rounded-full bg-gradient-to-r from-white to-[#8AB2FF]/5 dark:from-gray-800 dark:to-blue-900/20 border border-[#0F62FE]/30 dark:border-blue-400/30 shadow-md shadow-black/10 text-blue-600 dark:text-blue-400">
                        ⚡ AI-Powered Invoice Management
                    </Badge>

                    <h1 className="font-sans text-4xl sm:text-5xl lg:text-[63px] leading-tight lg:leading-[78.75px] text-[#101828] dark:text-white mb-6 lg:mb-8 max-w-4xl mx-auto">
                        Generate and verify<br className="hidden sm:block" />
                        invoices with <span className="relative pb-2">AI precision
                            <div className="absolute bottom-0 left-0 right-0 h-[8px] lg:h-[11px] bg-[#0F62FE1A] dark:bg-blue-400/20"></div>
                        </span>
                    </h1>

                    <p className="font-sans text-base sm:text-lg lg:text-[17.5px] leading-relaxed lg:leading-[28.44px] text-[#4A5565] dark:text-gray-300 mb-8 lg:mb-12 max-w-3xl mx-auto">
                        Automate your invoicing workflow with intelligent AI that learns from your data,
                        reduces errors, and saves you hours every week.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                        <Button
                            size="lg"
                            onClick={() => router.push('/login')}
                            className="bg-[#0F62FE] hover:bg-blue-700 text-white w-full sm:w-[175px] rounded-full font-semibold text-base lg:text-lg h-[56px] lg:h-[69px] px-4 lg:px-[14px] gap-3"
                            style={{ boxShadow: '0 4px 6px -4px rgba(15, 98, 254, 0.2), 0 10px 15px -3px rgba(15, 98, 254, 0.2)' }}
                        >
                            Request a Demo <ArrowRight className="h-5 w-5" />
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-[#0F62FE] dark:text-blue-400 border-2 border-[#0F62FE]/30 dark:border-blue-400/30 hover:border-[#0F62FE]/50 dark:hover:border-blue-400/50 w-full sm:w-[173px] rounded-full font-semibold text-base lg:text-lg h-[56px] lg:h-[69px] px-4 lg:px-[14px] gap-3"
                            style={{ boxShadow: '0 4px 6px -4px rgba(15, 98, 254, 0.1), 0 10px 15px -3px rgba(15, 98, 254, 0.1)' }}
                        >
                            Watch Video
                        </Button>
                    </div>

                    <div className="flex flex-wrap justify-center gap-4 sm:gap-8">
                        <FeatureItem>No credit card required</FeatureItem>
                        <FeatureItem>14-day free trial</FeatureItem>
                        <FeatureItem>Cancel anytime</FeatureItem>
                    </div>
                </div>

                <div className="relative mx-auto w-full max-w-8xl mb-20">
                    <InvoicePreviewSection />
                </div>
            </div>
        </section>
    );
}