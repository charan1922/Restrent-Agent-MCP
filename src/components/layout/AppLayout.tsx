"use client";

import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { cn } from "@/lib/utils";
import { SidebarProvider, useSidebar } from "./SidebarContext";

interface AppLayoutProps {
    children: React.ReactNode;
    className?: string;
}

function LayoutInner({ children, className }: { children: React.ReactNode; className?: string }) {
    const { collapsed } = useSidebar();
    const marginClass = collapsed ? "lg:ml-16" : "lg:ml-64";
    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar />
            {/* Main content area */}
            <main
                className={cn(
                    marginClass,
                    "transition-all duration-300",
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

export function AppLayout({ children, className }: AppLayoutProps) {
    return (
        <SidebarProvider>
            <LayoutInner className={className}>{children}</LayoutInner>
        </SidebarProvider>
    );
};
