"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function FinalCTASection() {
    return (
        <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-gray-900 dark:bg-gray-950">
            <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 lg:mb-8 leading-tight">
                    Ready to transform your invoicing?
                </h2>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button className="bg-white dark:bg-gray-100 text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-200 px-6 sm:px-8 py-5 text-base sm:text-lg font-medium rounded-3xl">
                        Schedule a Call
                    </Button>
                    <Button className="bg-blue-500 dark:bg-blue-600 text-white hover:bg-blue-600 dark:hover:bg-blue-700 px-6 sm:px-8 py-5 text-base sm:text-lg font-medium rounded-3xl">
                        Start Free Trial <ArrowRight className="ml-2 h-4 sm:h-5 w-4 sm:w-5" />
                    </Button>
                </div>
            </div>
        </section>
    );
}