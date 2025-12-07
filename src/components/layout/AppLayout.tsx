"use client";

import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
    children: React.ReactNode;
    className?: string;
}

export function AppLayout({ children, className }: AppLayoutProps) {
    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar />

            {/* Main content area */}
            <main
                className={cn(
                    "lg:ml-64 transition-all duration-300",
                    "min-h-screen flex flex-col",
                    className
                )}
            >
                <Header />
                <div className="flex-1">
                    {children}
                </div>
            </main>
        </div>
    );
}
