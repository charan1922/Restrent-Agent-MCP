"use client";

import { createContext, useContext, ReactNode } from "react";
import { Tenant, getTenantFromHost, TENANTS } from "@/lib/tenants/registry";
import { useAdminImpersonation } from "@/contexts/AdminImpersonationContext";

interface TenantContextProps {
    tenant: Tenant | null;
}

const TenantContext = createContext<TenantContextProps>({ tenant: null });

export const TenantProvider = ({ children }: { children: ReactNode }) => {
    const { state } = useAdminImpersonation();

    // In the browser we can read window.location.host
    const host = typeof window !== "undefined" ? window.location.host : "";

    let tenant: Tenant | null = null;

    // 1. Check for active impersonation
    if (state.tenantId) {
        tenant = TENANTS.find((t) => t.id === state.tenantId) ?? null;
    }

    // 2. Fallback to host-based resolution
    if (!tenant) {
        tenant = getTenantFromHost(host) ?? null;
    }

    return (
        <TenantContext.Provider value={{ tenant }}>
            {children}
        </TenantContext.Provider>
    );
};

export const useTenant = () => {
    const ctx = useContext(TenantContext);
    if (!ctx) {
        throw new Error("useTenant must be used within TenantProvider");
    }
    return ctx;
};
