"use client";

import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { FileText } from "lucide-react";
import { APP_ROUTES } from "@/app/constants/app-routes";

const NAV_LINKS = [
    { name: "Features", href: "#features" },
    { name: "Integrations", href: "#integrations" },
    { name: "Pricing", href: "#pricing" },
    { name: "FAQ", href: "#faq" }
];

const handleNavigation = (e, href) => {
    const element = document.querySelector(href);
    if (element) {
        element.scrollIntoView({ behavior: "smooth" });
    }
};

const NavLink = ({ name, href }) => (
    <a
        href={href}
        onClick={(e) => handleNavigation(e, href)}
        className="hidden md:inline font-sans text-sm text-slate-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
    >
        {name}
    </a>
);

export function Header() {
    return (
        <div className="mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-4">
            <div className="flex items-center justify-between w-full h-8 mx-auto opacity-100">
                <div
                    className="flex items-center space-x-2 cursor-pointer"
                    onClick={() => window.location.href = '/'}
                >
                    <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <FileText className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-sans font-normal text-lg leading-6 text-slate-900 dark:text-slate-100">
                        InvoiceAI
                    </span>
                </div>

                <div className="flex items-center space-x-4 lg:space-x-6">
                    {NAV_LINKS.map((link) => (
                        <NavLink key={link.name} {...link} />
                    ))}
                    <ModeToggle />
                    <button
                        onClick={() => window.location.href = APP_ROUTES.LOGIN}
                        className="font-sans text-sm text-slate-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        Log In
                    </button>
                    <Button
                        onClick={() => window.location.href = APP_ROUTES.LOGIN}
                        className="bg-blue-600 hover:bg-blue-700 text-sm text-white px-4 lg:px-6 py-2 rounded-full font-medium"
                    >
                        Request a Demo
                    </Button>
                </div>
            </div>
        </div >
    );
}