"use client";

import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { SidebarProvider } from "@/components/layout/SidebarContext";
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";
import { AdminImpersonationProvider } from "@/contexts/AdminImpersonationContext";
import { TenantProvider } from "@/contexts/TenantContext";
import ImpersonationBanner from "@/components/admin/ImpersonationBanner";

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider>
            <AuthProvider>
                <SidebarProvider>
                    <AdminAuthProvider>
                        <AdminImpersonationProvider>
                            <TenantProvider>
                                <ImpersonationBanner />
                                {children}
                            </TenantProvider>
                        </AdminImpersonationProvider>
                    </AdminAuthProvider>
                </SidebarProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}
