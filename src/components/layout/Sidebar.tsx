"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    MessageSquare,
    UtensilsCrossed,
    Settings,
    LayoutDashboard,
    ChevronLeft,
    Menu as MenuIcon,
} from "lucide-react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { useSidebar } from "./SidebarContext";
import { useTheme } from "@/contexts/ThemeContext";

const getNavigationItems = (role: string | null) => {
    const base = [
        {
            label: "Chat",
            href: "/agent",
            icon: MessageSquare,
        },
        {
            label: "Dashboard",
            href: "/admin",
            icon: LayoutDashboard,
        },
        {
            label: "Menu",
            href: "/admin/menu",
            icon: UtensilsCrossed,
        },
        {
            label: "Settings",
            href: "/admin/settings",
            icon: Settings,
        },
    ];
    if (role === "admin") {
        base.push({
            label: "Super‑Admin",
            href: "/admin",
            icon: Settings,
        });
    }
    return base;
};

export function Sidebar() {
    const pathname = usePathname();
    const { collapsed, setCollapsed } = useSidebar();
    const { role } = useAdminAuth();
    const { theme } = useTheme();
    const navigationItems = getNavigationItems(role);

    return (
        <>
            {/* Mobile menu button */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white border shadow-sm"
            >
                <MenuIcon className="w-5 h-5" />
            </button>

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed left-0 top-0 h-screen bg-white border-r transition-all duration-300 z-40",
                    collapsed ? "w-16" : "w-64",
                    "max-lg:hidden"
                )}
            >
                {/* Header */}
                <div className="h-16 flex items-center justify-between px-4 border-b">
                    {!collapsed && (
                        <div className="flex items-center gap-2">
                            <UtensilsCrossed
                                className="w-6 h-6"
                                style={{ color: theme.primaryColor }}
                            />
                            <span className="font-semibold text-lg">{theme.tenantName}</span>
                        </div>
                    )}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                    >
                        <ChevronLeft
                            className={cn(
                                "w-5 h-5 transition-transform",
                                collapsed && "rotate-180"
                            )}
                        />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="p-3 space-y-1">
                    {navigationItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                                    isActive
                                        ? "bg-orange-50 text-[var(--color-primary)] font-medium"
                                        : "text-gray-700 hover:bg-gray-50",
                                    collapsed && "justify-center"
                                )}
                                title={collapsed ? item.label : undefined}
                            >
                                <Icon className="w-5 h-5 flex-shrink-0" />
                                {!collapsed && <span>{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                {!collapsed && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-gray-50">
                        <p className="text-xs text-gray-500 text-center">
                            AI Waiter System v1.0
                        </p>
                    </div>
                )}
            </aside>

            {/* Mobile sidebar */}
            {!collapsed && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-30"
                    onClick={() => setCollapsed(true)}
                />
            )}
            <aside
                className={cn(
                    "lg:hidden fixed left-0 top-0 h-screen w-64 bg-white border-r transition-transform duration-300 z-40",
                    collapsed ? "-translate-x-full" : "translate-x-0"
                )}
            >
                {/* Same content as desktop sidebar */}
                <div className="h-16 flex items-center justify-between px-4 border-b">
                    <div className="flex items-center gap-2">
                        <UtensilsCrossed className="w-6 h-6 text-[var(--color-primary)]" />
                        <span className="font-semibold text-lg">Restaurant</span>
                    </div>
                    <button
                        onClick={() => setCollapsed(true)}
                        className="p-1.5 rounded-md hover:bg-gray-100"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                </div>

                <nav className="p-3 space-y-1">
                    {navigationItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setCollapsed(true)}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                                    isActive
                                        ? "bg-orange-50 text-[var(--color-primary)] font-medium"
                                        : "text-gray-700 hover:bg-gray-50"
                                )}
                            >
                                <Icon className="w-5 h-5" />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </aside>
        </>
    );
}
