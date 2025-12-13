"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAdminAuth, AdminRole } from "@/contexts/AdminAuthContext";

export default function RequireRole({
    allowedRoles,
    children,
}: {
    allowedRoles: AdminRole[];
    children: React.ReactNode;
}) {
    const { role } = useAdminAuth();
    const router = useRouter();

    useEffect(() => {
        // If no role logic is needed (e.g. auth check is handled elsewhere) adjust conditions
        // Assuming role is null initially or if not logged in
        if (!role || !allowedRoles.includes(role)) {
            router.replace("/admin/login");
        }
    }, [role, allowedRoles, router]);

    // Show nothing while checking (or a loader)
    if (!role || !allowedRoles.includes(role)) {
        return null;
    }

    return <>{children}</>;
}
