"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export function Header() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const { theme } = useTheme();

    const handleLogout = async () => {
        await logout();
        router.push("/login");
    };

    // Use tenant name from theme context
    const tenantName = theme.tenantName;

    return (
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6">
            <div className="flex items-center gap-3">
                <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: theme.primaryColor }}
                >
                    {tenantName.charAt(0)}
                </div>
                <div>
                    <h1 className="text-lg font-bold text-gray-900">{tenantName}</h1>
                    <p className="text-xs text-gray-500">AI Waiter System</p>
                </div>
            </div>

            {user && (
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <User className="w-5 h-5 text-gray-600" />
                        <div className="text-sm">
                            <p className="font-medium text-gray-900">{user.name}</p>
                            <p className="text-xs text-gray-500">{user.phone}</p>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-[var(--color-primary)] hover:bg-orange-50 rounded-lg transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </button>
                </div>
            )}
        </header>
    );
}
