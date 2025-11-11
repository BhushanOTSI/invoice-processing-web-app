"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const integrations = [
    "QuickBooks", "Xero", "SAP", "Oracle", "NetSuite", "FreshBooks",
    "Salesforce", "Stripe", "PayPal", "Square", "Wave", "Zoho"
];

export function IntegrationsSection() {
    return (
        <section id="integrations" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-gray-900 dark:bg-gray-950">
            <div className="max-w-6xl mx-auto text-center">
                <div className="mb-4 lg:mb-6">
                    <h2 className="font-lexend font-normal text-4xl leading-tight tracking-normal text-center text-white mb-4 lg:mb-6">
                        Don&apos;t replace. <span className="text-blue-400 dark:text-blue-300">Integrate.</span>
                    </h2>
                    <p className="font-lexend font-normal text-lg sm:text-xl text-gray-300 dark:text-gray-300 max-w-xl mx-auto leading-relaxed">
                        InvoiceAI seamlessly connects with your existing accounting software, CRM, and payment platforms.
                        No disruption, just enhanced productivity.
                    </p>
                </div>
                <div className="mb-6 lg:mb-8">
                    <Button className="bg-white dark:bg-gray-100 text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-200 px-6 sm:px-8 py-3 text-base sm:text-sm font-medium rounded-full transition-all duration-300">
                        Explore Integrations <ArrowRight className="ml-2 h-4 sm:h-5 w-4 sm:w-5" />
                    </Button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
                    {integrations.map((integration, i) => (
                        <div key={i} className="bg-gray-800/50 dark:bg-gray-700/50 hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors duration-300 rounded-xl sm:rounded-2xl p-4 sm:p-6 flex items-center justify-center border border-white/20 h-16 sm:h-20">
                            <span className="text-white/60 dark:text-white/60 font-medium text-xs sm:text-sm">{integration}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}