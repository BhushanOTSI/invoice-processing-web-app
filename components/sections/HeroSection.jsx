"use client";

import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import SparkleIcon from "@/public/landinglogs/sparkle.svg";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InvoicePreviewSection } from "./InvoicePreviewSection";

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

const FeatureList = ({ features, className = "" }) => (
    <div className={`flex flex-wrap justify-center gap-4 sm:gap-8 ${className}`.trim()}>
        {features.map((feature, index) => (
            <FeatureItem key={index}>{feature}</FeatureItem>
        ))}
    </div>
);

const HERO_FEATURES = [
    "No credit card required",
    "14-day free trial",
    "Cancel anytime"
];

export function HeroSection() {
    const router = useRouter();

    const handleDemoRequest = () => router.push('/login');

    return (
        <section id="hero" className="py-6 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-10 lg:mb-14">
                    <div className="relative inline-block">
                        <Badge className="mb-6 lg:mb-8 px-4 py-2 text-sm font-medium rounded-full bg-gradient-to-r from-white via-blue-200/40 via-blue-300 via-blue-200/40 to-white dark:from-gray-800 dark:to-blue-900/20 border border-blue-600/30 dark:border-blue-400/30 shadow-md shadow-black/10 text-gray-700 dark:text-blue-400">
                            <SparkleIcon className="w-4 h-4" /> AI-Powered Invoice Management
                            <div className="absolute top-2 right-2 w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                        </Badge>
                    </div>

                    <h1 className="font-sans text-4xl sm:text-5xl lg:text-6xl leading-tight lg:leading-tight text-gray-900 dark:text-white mb-6 lg:mb-8 max-w-4xl mx-auto">
                        Generate and verify
                        <br className="hidden sm:block" />
                        invoices with{" "}
                        <span className="relative pb-2">
                            AI precision
                            <div className="absolute bottom-0 left-0 right-0 h-2 lg:h-3 bg-blue-100 dark:bg-blue-400/20" />
                        </span>
                    </h1>

                    <p className="font-sans text-base sm:text-lg lg:text-lg leading-relaxed text-gray-600 dark:text-gray-300 mb-8 lg:mb-12 max-w-xl mx-auto">
                        Automate your invoicing workflow with intelligent AI that learns
                        from your data, reduces errors, and saves you hours every week.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                        <Button
                            size="lg"
                            onClick={handleDemoRequest}
                            className="bg-blue-500 hover:bg-blue-700 text-white w-full sm:w-48 rounded-full font-semibold text-base lg:text-lg h-16 lg:h-18 px-6 lg:px-6 gap-3 shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-600/30 transition-all duration-300"
                        >
                            Request a Demo <ArrowRight className="h-5 w-5" />
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="bg-white text-gray-600 dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-blue-400 border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 w-full sm:w-44 rounded-full font-semibold lg:text-lg h-16 lg:h-18 px-6 lg:px-6 gap-3 shadow-md shadow-gray-500/10 hover:shadow-lg hover:shadow-gray-500/20 transition-all duration-300"
                        >
                            Watch Video
                        </Button>
                    </div>

                    <FeatureList features={HERO_FEATURES} />
                </div>

                <div className="relative mx-auto w-full">
                    <InvoicePreviewSection />
                </div>
            </div>
        </section>
    );
}