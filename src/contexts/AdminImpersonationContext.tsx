"use client";
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
export interface ImpersonationState {
    tenantId: string | null;
    mode: "read" | "full" | null;
    token: string | null;
    expiresAt: number | null;
}

interface AdminImpersonationContextProps {
    state: ImpersonationState;
    start: (tenantId: string, mode: "read" | "full", durationMinutes?: number) => void;
    exit: () => void;
}

const AdminImpersonationContext = createContext<AdminImpersonationContextProps | undefined>(undefined);

export const AdminImpersonationProvider = ({ children }: { children: ReactNode }) => {
    const [state, setState] = useState<ImpersonationState>({
        tenantId: null,
        mode: null,
        token: null,
        expiresAt: null,
    });

    const start = (tenantId: string, mode: "read" | "full", durationMinutes = 30) => {
        const token = btoa(`${tenantId}:${mode}:${Date.now()}`);
        const expiresAt = Date.now() + durationMinutes * 60 * 1000;
        setState({ tenantId, mode, token, expiresAt });
    };

    const exit = () => {
        setState({ tenantId: null, mode: null, token: null, expiresAt: null });
    };

    // Auto‑expire impersonation
    useEffect(() => {
        if (!state.expiresAt) return;
        const timeout = setTimeout(() => exit(), state.expiresAt - Date.now());
        return () => clearTimeout(timeout);
    }, [state.expiresAt]);

    return (
        <AdminImpersonationContext.Provider value={{ state, start, exit }}>
            {children}
        </AdminImpersonationContext.Provider>
    );
};

export const useAdminImpersonation = () => {
    const ctx = useContext(AdminImpersonationContext);
    if (!ctx) {
        throw new Error("useAdminImpersonation must be used within AdminImpersonationProvider");
    }
    return ctx;
};
