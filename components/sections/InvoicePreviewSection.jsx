"use client";

import { FileText, Shield, Zap } from "lucide-react";
import Sparkle from "@/public/landinglogs/sparkle.svg";

const invoiceData = {
    number: "#INV-2025-001",
    company: "Acme Corp",
    issueDate: "Jan 15, 2025",
    dueDate: "Feb 15, 2025",
    items: [
        { name: "Professional Services", amount: "$6,000.00" },
        { name: "Consulting", amount: "$4,000.00" }
    ],
    subtotal: "$10,000.00",
    tax: "$800.00",
    total: "$10,800.00"
};

const InvoiceCard = ({ data, className = "", isBackground = false }) => (
    <div className={`bg-gradient-to-br from-white via-white to-gray-50/30 dark:from-gray-800 dark:via-gray-800 dark:to-gray-700/30 rounded-2xl border border-[#F3F4F6] dark:border-gray-600 border-t-[0.8px] border-t-[#F3F4F6] dark:border-t-gray-500 shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] dark:shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.5)] ${className}`}>
        <div className="p-4 sm:p-6 lg:p-8">
            {!isBackground && (
                <>
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 sm:w-10 h-8 sm:h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                <FileText className="w-4 sm:w-5 h-4 sm:h-5 text-white" />
                            </div>
                            <div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium tracking-wide">INVOICE</div>
                                <div className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">{data.number}</div>
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                            <span className="bg-green-50 dark:bg-green-50 border border-green-100 dark:border-green-100 px-3 py-1 rounded-full text-green-600 dark:text-green-600 flex items-center gap-1 whitespace-nowrap text-right tracking-normal font-normal text-[10.5px] leading-[14px] text-xs sm:text-xs">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                <Sparkle className="w-3 h-3" />
                                AI Verified
                            </span>
                        </div>
                    </div>

                    {/* Invoice Details Grid */}
                    <div className="relative grid grid-cols-3 gap-3 mb-6 mt-4">
                        {[
                            { label: "Bill To:", value: data.company },
                            { label: "Issue Date:", value: data.issueDate },
                            { label: "Due Date:", value: data.dueDate }
                        ].map((item, i) => (
                            <div key={i}>
                                <div className="w-full h-auto min-h-14 sm:min-h-16 p-3 sm:p-4 rounded-xl border bg-gradient-to-br from-[#F9FAFB] to-white dark:from-gray-800 dark:to-gray-700 border-[#F3F4F6] dark:border-gray-600">
                                    <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">{item.label}</div>
                                    <div className="font-semibold text-gray-900 dark:text-white">{item.value}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="h-px bg-gray-100 dark:bg-gray-700 mb-8 mt-8 w-[80%]"></div>

                    {/* Items */}
                    <div className="relative space-y-2 sm:space-y-3 mb-4">
                        {data.items.map((item, i) => (
                            <div key={i} className="flex justify-between items-center p-1 sm:p-2 bg-gradient-to-r from-gray-50/50 via-gray-50 via-gray-100 via-gray-200 via-gray-100 via-gray-50 to-gray-50/50 dark:from-gray-800 dark:via-gray-700 dark:via-gray-600 dark:via-gray-500 dark:via-gray-600 dark:to-gray-800 border-t-[0.8px] border-[#DBEAFE80]/50 dark:border-blue-800/50 rounded-4xl w-[90%]">
                                <span className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base pl-3">{item.name}</span>
                                <span className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base pr-3">{item.amount}</span>
                            </div>
                        ))}
                    </div>

                    {/* Totals */}
                    <div className="space-y-2 mb-4">
                        <div className="border border-gray-200 dark:border-gray-600 bg-gradient-to-br from-[#F9FAFB] to-[#FFFFFF] dark:from-gray-800 dark:to-gray-700 rounded-xl p-4 w-[90%]">
                            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                                <span>Subtotal:</span><span>{data.subtotal}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                                <span>Tax (8%):</span><span>{data.tax}</span>
                            </div>
                            <div className="flex justify-between text-base sm:text-lg font-bold text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-gray-600">
                                <span>Total:</span><span>{data.total}</span>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    </div>
);

export function InvoicePreviewSection() {
    return (
        <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="relative mx-auto w-[95%] sm:w-[85%] md:w-[60%] lg:w-[79%] max-w-6xl">
                    {/* Background Cards for Depth */}
                    {/* <InvoiceCard
                        data={invoiceData}
                        isBackground={true}
                        className="absolute top-2 sm:top-4 left-2 sm:left-4 w-full h-full opacity-30 shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] dark:shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.4)]"
                    /> */}
                    {/* <InvoiceCard
                        data={invoiceData}
                        isBackground={true}
                        className="absolute top-1 sm:top-2 left-1 sm:left-2 w-full h-full opacity-40 bg-white dark:bg-gray-800 shadow-[0px_8px_10px_-6px_rgba(0,0,0,0.1),0px_20px_25px_-5px_rgba(0,0,0,0.1)] dark:shadow-[0px_8px_10px_-6px_rgba(0,0,0,0.3),0px_20px_25px_-5px_rgba(0,0,0,0.3)]"
                    /> */}

                    {/* Main Invoice Card */}
                    <div className="relative">
                        <InvoiceCard data={invoiceData} />

                        {/* Generation Time Badge */}
                        <div className="absolute -bottom-4 -right-4 sm:-bottom-6 sm:-right-6">
                            <div className="bg-gray-900 dark:bg-gray-800 text-white px-4 py-2 rounded-2xl text-sm font-medium flex items-center gap-2 shadow-xl">
                                <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center">
                                    <Zap className="w-3 h-3 text-white" />
                                </div>
                                <div>
                                    <div className="text-xs text-gray-300">Generated in</div>
                                    <div className="font-bold">2.3s</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}