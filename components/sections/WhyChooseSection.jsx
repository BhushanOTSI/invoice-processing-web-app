"use client";

import { Clock, TrendingUp, BarChart3 } from "lucide-react";

const features = [
    {
        id: "save-time",
        icon: Clock,
        title: "Save Time",
        description: "Reduce invoice processing time from hours to minutes with intelligent automation.",
        bgColor: "purple",
        hasVerticalBorder: false
    },
    {
        id: "increase-accuracy",
        icon: TrendingUp,
        title: "Increase Accuracy",
        description: "Eliminate human errors with AI-powered verification and validation checks.",
        bgColor: "orange",
        hasVerticalBorder: true
    },
    {
        id: "gain-insights",
        icon: BarChart3,
        title: "Gain Insights",
        description: "Get real-time analytics and insights into your invoicing patterns and trends.",
        bgColor: "blue",
        hasVerticalBorder: false
    }
];

export function WhyChooseSection() {
    return (
        <section id="features" className="py-8 sm:py-12 lg:py-16 xl:py-20 px-4 sm:px-6 lg:px-8 dark:bg-gray-900">
            <div className="max-w-8xl mx-auto">
                <div className="text-center mb-8 sm:mb-12 lg:mb-16">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold font-medium text-gray-900 dark:text-white mb-4 lg:mb-6 leading-tight">
                        Why teams choose InvoiceAI
                    </h2>
                    <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
                        Join thousands of businesses that have transformed their invoicing process.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                    {features.map((feature) => (
                        <div key={feature.id} className={`bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl p-6 lg:p-8 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-shadow duration-300 ${feature.hasVerticalBorder ? 'md:border-x md:border-gray-300 dark:md:border-gray-600' : ''}`}>
                            <div className={`w-10 sm:w-12 h-10 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 bg-${feature.bgColor}-100 dark:bg-${feature.bgColor}-900/30`}>
                                <feature.icon className={`h-5 sm:h-6 w-5 sm:w-6 text-${feature.bgColor}-600 dark:text-${feature.bgColor}-400`} />
                            </div>
                            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                                {feature.title}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}