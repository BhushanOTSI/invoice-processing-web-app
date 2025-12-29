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
    tax: "$1,000.00",
    total: "$11,000.00"
};

const InvoiceCard = ({ data, className = "", isBackground = false }) => (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl border border-[#F3F4F6] dark:border-gray-600 border-t-[0.8px] border-t-[#F3F4F6] dark:border-t-gray-500 ${className}`}>
        <div className="pt-4 sm:pt-6 lg:pt-8 px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 lg:pb-8">
            {!isBackground && (
                <>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-8 sm:w-10 h-8 sm:h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                <FileText className="w-4 sm:w-5 h-4 sm:h-5 text-white" />
                            </div>
                            <div className="min-w-0">
                                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium tracking-wide">INVOICE</div>
                                <div className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 dark:text-white truncate">{data.number}</div>
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-1 ml-2">
                            <span className="bg-green-50 dark:bg-green-900/30 border border-green-100 dark:border-green-800 px-2 sm:px-3 py-1 rounded-full text-green-600 dark:text-green-400 flex items-center gap-1 whitespace-nowrap text-right tracking-normal font-normal text-[9px] sm:text-[10.5px] leading-[12px] sm:leading-[14px]">
                                <div className="w-1.5 h-1.5 bg-green-500 dark:bg-green-400 rounded-full"></div>
                                <Sparkle className="w-2.5 sm:w-3 h-2.5 sm:h-3 text-green-600 dark:text-green-400" />
                                AI Verified
                            </span>
                        </div>
                    </div>

                    <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-6 mt-4">
                        {[
                            { label: "Bill To:", value: data.company },
                            { label: "Issue Date:", value: data.issueDate },
                            { label: "Due Date:", value: data.dueDate }
                        ].map((item, i) => (
                            <div key={i}>
                                <div className="w-full h-auto min-h-12 sm:min-h-14 lg:min-h-16 p-2 sm:p-3 lg:p-4 rounded-xl border bg-gradient-to-br from-[#F9FAFB] to-white dark:from-gray-800 dark:to-gray-700 border-[#F3F4F6] dark:border-gray-600">
                                    <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">{item.label}</div>
                                    <div className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">{item.value}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="h-px bg-gray-100 dark:bg-gray-700 mb-6 sm:mb-8 mt-6 sm:mt-8 w-[80%]"></div>

                    <div className="relative space-y-2 sm:space-y-3 mb-4">
                        {data.items.map((item, i) => (
                            <div key={i} className="flex justify-between items-center p-2 sm:p-1 lg:p-2 bg-gradient-to-r from-gray-50/50 via-gray-50 via-gray-100 via-gray-200 via-gray-100 via-gray-50 to-gray-50/50 dark:from-gray-800 dark:via-gray-700 dark:via-gray-600 dark:via-gray-500 dark:via-gray-600 dark:to-gray-800 border-t-[0.8px] border-[#DBEAFE80]/50 dark:border-blue-800/50 rounded-xl sm:rounded-4xl w-full sm:w-[90%]">
                                <span className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm lg:text-base pl-2 sm:pl-3 truncate flex-1 mr-2">{item.name}</span>
                                <span className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm lg:text-base pr-2 sm:pr-3 whitespace-nowrap">{item.amount}</span>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-2 mb-4">
                        <div className="border border-gray-200 dark:border-gray-600 bg-gradient-to-br from-[#F9FAFB] to-[#FFFFFF] dark:from-gray-800 dark:to-gray-700 rounded-xl p-3 sm:p-4 w-full sm:w-[90%]">
                            <div className="flex justify-between text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                                <span>Subtotal:</span><span className="font-medium">{data.subtotal}</span>
                            </div>
                            <div className="flex justify-between text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1">
                                <span>Tax (10%):</span><span className="font-medium">{data.tax}</span>
                            </div>
                            <div className="flex justify-between text-sm sm:text-base lg:text-lg font-bold text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-gray-600 mt-2">
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
        <section className="px-4 sm:px-6 lg:px-8 mb-16 sm:mb-20">
            <div className="max-w-7xl mx-auto">
                <div className="relative mx-auto w-full sm:w-[95%] md:w-[85%] lg:w-[79%] max-w-6xl">

                    <div className="relative">
                        <div className="absolute top-8 sm:top-12 left-3 sm:left-6 right-[-8px] sm:right-[-12px] bottom-[-8px] sm:bottom-[-12px] z-0">
                            <div className="w-full h-full bg-gradient-to-br from-gray-200 via-gray-100 to-white dark:from-gray-600 dark:via-gray-700 dark:to-gray-800 rounded-2xl border border-gray-200 dark:border-gray-500" style={{ boxShadow: '0px 8px 20px -5px rgba(0,0,0,0.12), 2px 0px 10px -5px rgba(0,0,0,0.04), -2px 0px 10px -5px rgba(0,0,0,0.04)' }}></div>
                        </div>

                        <div className="absolute top-4 sm:top-6 left-2 sm:left-3 right-[-4px] sm:right-[-6px] bottom-[-4px] sm:bottom-[-6px] z-0">
                            <div className="w-full h-full bg-gradient-to-br from-gray-100 via-gray-100 to-gray-100 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-2xl border border-gray-100 dark:border-gray-400" style={{ boxShadow: '0px 4px 12px -2px rgba(0,0,0,0.08), 1px 0px 6px -2px rgba(0,0,0,0.04), -1px 0px 6px -2px rgba(0,0,0,0.04)' }} ></div>
                        </div>

                        <div className="relative z-10">
                            <InvoiceCard data={invoiceData} />

                            <div className="absolute top-6 sm:top-10 -left-20 sm:-left-36 z-30">
                                <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl px-3 sm:px-6 py-2 sm:py-4 border border-gray-100/70 dark:border-gray-600 flex items-center gap-1 sm:gap-2 shadow-[0px_6px_9px_-6px_#0000001A]">
                                    <div className="w-6 h-6 sm:w-10 sm:h-10 bg-blue-100/50 rounded-md sm:rounded-lg flex items-center justify-center">
                                        <Shield className="w-3 h-3 sm:w-5 sm:h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <div className="text-xs sm:text-lg text-gray-500 dark:text-gray-400 font-medium">Accuracy</div>
                                        <div className="text-sm sm:text-xl font-bold text-gray-800 dark:text-white">99.8%</div>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute top-28 sm:top-44 -right-8 sm:-right-17 z-30">
                                <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl px-3 sm:px-6 py-2 sm:py-4 border border-gray-100/70 dark:border-gray-600 flex items-center gap-1 sm:gap-2 shadow-[0px_6px_9px_-6px_#0000001A]">
                                    <div className="w-6 h-6 sm:w-10 sm:h-10 bg-purple-100/50 rounded-md sm:rounded-lg flex items-center justify-center">
                                        <svg className="w-4 h-4 sm:w-6 sm:h-6 text-[#9810FA] stroke-current" viewBox="0 0 20 20" fill="none">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" strokeWidth="2" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="text-xs sm:text-lg text-gray-500 dark:text-gray-400 font-medium">Rating</div>
                                        <div className="text-sm sm:text-xl font-bold text-gray-900 dark:text-white">4.9/5</div>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute -bottom-1 -right-2 sm:-bottom-8 sm:-right-14 z-30">
                                <div className="bg-gray-900 dark:bg-gray-800 text-white px-4 sm:px-8 py-3 sm:py-5 rounded-xl border border-[#0F62FE33] sm:rounded-2xl text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-2" style={{ boxShadow: '0px 12px 15px -9px #0000001A, 0px 30px 37.5px -7.5px #0000001A' }}>
                                    <div className="w-6 h-6 sm:w-10 sm:h-10 bg-blue-600 rounded-md sm:rounded-lg flex items-center justify-center">
                                        <Sparkle className="w-3 h-3 sm:w-5 sm:h-5 brightness-0 invert" />
                                    </div>
                                    <div>
                                        <div className="text-xs sm:text-sm text-gray-300">Generated in</div>
                                        <div className="text-lg sm:text-2xl font-bold text-white">2.3s</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}