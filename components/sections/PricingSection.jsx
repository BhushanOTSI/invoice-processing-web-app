"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Dollar from "@/public/landinglogs/dollar.svg";

const plans = [
    {
        name: "Starter",
        description: "Perfect for freelancers",
        price: "$29",
        period: "Forever",
        features: ["Up to 10 invoices/month", "Basic templates", "Email support", "Core AI features"],
        cta: "Start Free Trial",
        variant: "outline"
    },
    {
        name: "Professional",
        description: "For growing businesses",
        price: "$99",
        period: "month",
        features: ["Unlimited invoices", "Custom templates", "Priority support", "Advanced AI", "Integrations"],
        cta: "Get Started",
        variant: "default",
        popular: true
    },
    {
        name: "Enterprise",
        description: "For large organizations",
        price: "Custom",
        period: "Contact us",
        features: ["Everything in Pro", "Dedicated support", "Custom integrations", "SLA guarantee", "Training included"],
        cta: "Contact Sales",
        variant: "outline"
    }
];

const PricingCard = ({ plan }) => (
    <div
        className={`rounded-2xl sm:rounded-3xl p-6 lg:p-8 border transition-shadow duration-300 hover:shadow-lg relative ${plan.popular ? 'border-blue-500 dark:border-blue-400' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}
        style={plan.popular ? {
            background: 'linear-gradient(180deg, #161616 0%, #262626 100%)',
            boxShadow: '0px 25px 50px -12px #00000040'
        } : {
            boxShadow: '0px 1px 2px -1px #0000001A, 0px 1px 3px 0px #0000001A'
        }}
    >
        {plan.popular && (
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">Most Popular</span>
            </div>
        )}
        <div className="mb-3 lg:mb-4">
            <h3 className={`text-xl sm:text-2xl font-medium mb-2 ${plan.popular ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                {plan.name}
            </h3>
            <p className={`mb-4 lg:mb-6 ${plan.popular ? 'text-gray-300' : 'text-gray-600 dark:text-gray-300'}`}>
                {plan.description}
            </p>
            <div className="mb-4 lg:mb-6">
                <div className={`text-3xl sm:text-4xl lg:text-5xl font- ${plan.popular ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                    {plan.price}
                </div>
                <div className={`${plan.popular ? 'text-gray-300' : 'text-gray-600 dark:text-gray-300'}`}>
                    {plan.period}
                </div>
            </div>
        </div>
        <Button
            variant={plan.variant}
            className={`w-full text-base sm:text-lg font-semibold rounded-3xl mb-4 lg:mb-6 shadow-none ${plan.variant === 'default' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'border-1 sm:font-medium sm:text-[16px] border-gray-100 dark:border-gray-300 text-[#0A0A0A] dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700'}`}
        >
            {plan.cta} {plan.variant === 'default' && <ArrowRight className="ml-2 h-4 w-4" />}
        </Button>
        <ul className="space-y-3 sm:space-y-4 mb-6 lg:mb-8">
            {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-3">
                    <div className={`w-4 sm:w-4 h-4 sm:h-4 border-blue-500 border-2 rounded-full flex items-center justify-center`}>
                        <svg className="w-2 h-2 text-blue-500" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <span className={`text-sm sm:text-base ${plan.popular ? 'text-gray-300' : 'text-gray-600 dark:text-gray-300'}`}>
                        {feature}
                    </span>
                </li>
            ))}
        </ul>
    </div>
);

export function PricingSection() {
    return (
        <section id="pricing" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-black">
            <div className="max-w-8xl mx-auto">
                <div className="text-center mb-12 lg:mb-16">
                    <Badge className="mb-4 lg:mb-6 px-4 py-2 text-sm font-medium rounded-full bg-white dark:bg-blue-900/30 border border-[#E5E7EB]-200 dark:border-blue-700 text-blue-gray-800 dark:text-blue-400 inline-flex items-center gap-2 shadow-sm">
                        <Dollar className="w-5 h-5" />  Simple, Transparent Pricing
                    </Badge>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold font-medium text-gray-900 dark:text-white mb-4 lg:mb-6 leading-tight">
                        Choose your perfect plan
                    </h2>
                    <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
                        Start free, scale as you grow. All plans include our core AI features.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-8 lg:mb-12">
                    {plans.map((plan, i) => (
                        <PricingCard key={i} plan={plan} />
                    ))}
                </div>
                <div className="text-center">
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                        All plans include a 14-day free trial. No credit card required.
                    </p>
                    <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium inline-flex items-center gap-1">
                        Compare all features  →
                    </button>
                </div>
            </div>
        </section>
    );
}