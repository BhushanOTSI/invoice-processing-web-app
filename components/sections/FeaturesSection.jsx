"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Document from "@/public/landinglogs/document.svg";
import Guard from "@/public/landinglogs/gaurd.svg";
import Power from "@/public/landinglogs/power.svg";

const features = [
    {
        title: "AI Invoice Generation",
        description: "Create professional invoices in seconds. Our AI learns from your past invoices to automatically populate customer details, line items, and pricing—ensuring consistency and saving you valuable time.",
        icon: Document,
        items: ["Smart data extraction", "Custom templates", "Bulk generation"],
        color: "blue"
    },
    {
        title: "AI Invoice Verification",
        description: "Catch errors before they cost you. Our verification engine scans every detail, validates calculations, and flags potential issues, ensuring your invoices are always accurate and professional.",
        icon: Guard,
        items: ["Duplicate detection", "Tax validation", "Anomaly detection"],
        color: "green"
    }
];

const FeatureCard = ({ feature }) => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl p-6 lg:p-8 shadow-lg dark:shadow-2xl dark:shadow-black/20 border border-gray-100 dark:border-gray-700 hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-black/30 transition-all duration-300">
        <div className={`mb-6 lg:mb-8 h-80 sm:h-96 lg:h-96 bg-${feature?.color}-50 dark:bg-${feature?.color}-900/20 rounded-xl lg:rounded-2xl flex items-center justify-center relative overflow-hidden`}>
            <div className="relative z-10 text-center">
                <div className={`w-12 sm:w-14 lg:w-16 h-12 sm:h-14 lg:h-16 bg-${feature?.color}-100 dark:bg-${feature?.color}-900/40 rounded-xl lg:rounded-2xl flex items-center justify-center mx-auto mb-3 lg:mb-4`}>
                    <feature.icon className="w-6 sm:w-7 lg:w-8 h-6 sm:h-7 lg:h-8 text-white" />
                </div>
                <div className={`text-xs sm:text-sm font-medium text-${feature?.color}-600 dark:text-${feature?.color}-400  px-2 sm:px-3 py-1 rounded-full`}>
                    {feature.title} Visualization
                </div>
            </div>
        </div>
        <div className="space-y-4 lg:space-y-6">
            <span className="font-lexend font-normal text-3xl font-bold leading-7 tracking-normal text-gray-900 dark:text-white">
                {feature.title}
            </span>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm sm:text-base mt-3">
                {feature.description}
            </p>
            <div className="space-y-2 sm:space-y-3">
                {feature.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <div className={`w-4 sm:w-4 h-4 sm:h-4 border-blue-500 border-2 rounded-full flex items-center justify-center`}>
                            <svg className="w-2 h-2 text-blue-500" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <span className="text-gray-700 dark:text-gray-300 font-medium text-sm sm:text-base">{item}</span>
                    </div>
                ))}
            </div>
            <div className=" h-px bg-gray-100 dark:bg-gray-700 mb-8 mt-8 "></div>
            <Button className={`bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium w-full`}>
                Try Invoice Generator <ArrowRight className="ml-2 h-4 " />
            </Button>
        </div>
    </div>
);

export function FeaturesSection() {
    return (
        <section id="features" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900/85">
            <div className="max-w-12xl mx-auto">
                <div className="text-center mb-12 lg:mb-16">
                    <Badge className="mb-4 lg:mb-6 px-4 py-2 text-sm font-medium rounded-full bg-white dark:bg-blue-900/30 border border-gray-200 dark:border-blue-700 text-gray-800 dark:text-blue-400 inline-flex items-center gap-2 shadow-sm">
                        <Power className="w-10 h-10" /> Powerful Features
                    </Badge>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold font-medium text-gray-900 dark:text-white mb-4 lg:mb-6 leading-tight">
                        Everything you need to manage invoices
                    </h2>
                    <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
                        From generation to verification, our AI handles it all with unmatched accuracy.
                    </p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 max-w-12xl mx-auto">
                    {features.map((feature, i) => (
                        <FeatureCard key={i} feature={feature} />
                    ))}
                </div>
            </div>
        </section>
    );
}