"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";

// Simple role definitions for the parent (super‑admin) system
export type AdminRole = "viewer" | "support" | "admin";

interface AdminAuthContextProps {
    role: AdminRole | null;
    // In a real app this would be set after MFA, etc.
    loginAs: (role: AdminRole) => void;
    logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextProps | undefined>(undefined);

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
    const [role, setRole] = useState<AdminRole | null>(null);
    const router = useRouter();

    const loginAs = (newRole: AdminRole) => {
        setRole(newRole);
        // After login, redirect to admin dashboard
        router.push("/admin");
    };

    const logout = () => {
        setRole(null);
        router.push("/login");
    };

    // Example: automatically log out after 30 minutes of inactivity (placeholder)
    useEffect(() => {
        if (!role) return;
        const timeout = setTimeout(() => logout(), 30 * 60 * 1000);
        return () => clearTimeout(timeout);
    }, [role]);

    return (
        <AdminAuthContext.Provider value={{ role, loginAs, logout }}>
            {children}
        </AdminAuthContext.Provider>
    );
};

export const useAdminAuth = () => {
    const ctx = useContext(AdminAuthContext);
    if (!ctx) {
        throw new Error("useAdminAuth must be used within AdminAuthProvider");
    }
    return ctx;
};
