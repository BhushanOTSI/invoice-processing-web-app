"use client";

const stats = [
    { value: "99.8%", label: "Accuracy Rate" },
    { value: "2M+", label: "Invoices Processed" },
    { value: "-90%", label: "Processing Time" }
];

export function StatsSection() {
    return (
        <section id="features" className="py-8 sm:py-12 lg:py-16 xl:py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800 my-8 sm:my-12">
            <div className="w-full max-w-5xl mx-auto">
                <div className="flex flex-col space-y-8 md:space-y-0 md:flex-row justify-between items-center">
                    {stats.map((stat, i) => (
                        <div key={i} className="flex items-center">
                            <div className="text-center min-w-0 px-2 sm:px-4">
                                <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-2">
                                    {stat.value}
                                </div>
                                <div className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-300 font-medium">
                                    {stat.label}
                                </div>
                            </div>
                            {i < stats.length - 1 && (
                                <div className="hidden md:block w-px h-12 sm:h-14 lg:h-16 bg-gray-200 dark:bg-gray-600 mx-6 sm:mx-8 lg:mx-18 xl:mx-16"></div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}