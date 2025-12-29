"use client";

import { ChevronDown } from "lucide-react";

const faqs = [
    { id: "ai-generation", question: "How does the AI invoice generation work?" },
    { id: "integrations", question: "What integrations are available?" },
    { id: "data-security", question: "Is my data secure?" },
    { id: "templates", question: "Can I customize invoice templates?" },
    { id: "cancellation", question: "What if I need to cancel my subscription?" },
    { id: "support", question: "Do you offer customer support?" }
];

export function FAQSection() {
    return (
        <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 dark:bg-gray-800">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12 lg:mb-16">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold font-medium text-gray-900 dark:text-white mb-4 lg:mb-6 leading-tight">
                        Frequently asked questions
                    </h2>
                    <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                        Everything you need to know about InvoiceAI
                    </p>
                </div>
                <div className="space-y-4 sm:space-y-6">
                    {faqs.map((faq) => (
                        <div key={faq.id} className="bg-white dark:bg-gray-700 rounded-xl sm:rounded-2xl p-2 sm:p-4 border border-gray-100 dark:border-gray-600 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer">
                            <div className="flex items-center justify-between">
                                <h3 className="text-base font-medium text-gray-900 dark:text-white">
                                    {faq.question}
                                </h3>
                                <ChevronDown className="text-gray-400 dark:text-gray-300 w-5 h-5 flex-shrink-0" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}