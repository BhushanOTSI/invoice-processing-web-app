"use client";

import { FileText } from "lucide-react";

const sections = [
    {
        title: "Product",
        links: [
            { name: "Features", href: "#" },
            { name: "Integrations", href: "#" },
            { name: "Pricing", href: "#" },
            { name: "API", href: "#" }
        ]
    },
    {
        title: "Company",
        links: [
            { name: "About", href: "#" },
            { name: "Blog", href: "#" },
            { name: "Careers", href: "#" },
            { name: "Contact", href: "#" }
        ]
    },
    {
        title: "Legal",
        links: [
            { name: "Privacy", href: "#" },
            { name: "Terms", href: "#" },
            { name: "Security", href: "#" },
            { name: "Compliance", href: "#" }
        ]
    }
];

export function FooterSection() {
    return (
        <footer id="faq" className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 my-12">
            <div className="max-w-8xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
                    <div className="md:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <FileText className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                                InvoiceAI
                            </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                            AI-powered invoice generation and verification that helps businesses save time, reduce errors, and streamline their financial workflows.
                        </p>
                    </div>
                    {sections.map((section) => (
                        <div key={section.title}>
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">{section.title}</h4>
                            <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                                {section.links.map((link) => (
                                    <li key={link.name}>
                                        <a
                                            href={link.href}
                                            className="hover:text-gray-900 dark:hover:text-white transition-colors"
                                        >
                                            {link.name}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
                <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-200 dark:border-gray-700 text-center">
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                        © 2025 InvoiceAI. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}