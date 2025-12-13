"use client";

import RequireRole from "@/components/admin/RequireRole";
import { TENANTS } from "@/lib/tenants/registry";
import { useAdminImpersonation } from "@/contexts/AdminImpersonationContext";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

export default function AdminDashboard() {
    const { start } = useAdminImpersonation();
    const { role } = useAdminAuth();

    return (
        <RequireRole allowedRoles={["admin", "support"]}>
            <div className="p-8">
                <h1 className="text-3xl font-bold mb-6">Super‑Admin Dashboard</h1>

                <div className="bg-white rounded-lg shadowoverflow-hidden border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-800">Tenants Registry</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="bg-gray-50 text-gray-900 border-b">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Tenant Name</th>
                                    <th className="px-6 py-3 font-medium">ID (Subdomain)</th>
                                    <th className="px-6 py-3 font-medium">Host</th>
                                    <th className="px-6 py-3 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {TENANTS.map((tenant) => (
                                    <tr key={tenant.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">{tenant.name}</td>
                                        <td className="px-6 py-4">{tenant.id}</td>
                                        <td className="px-6 py-4 font-mono text-xs">{tenant.host}</td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button
                                                onClick={() => start(tenant.id, "read")}
                                                className="px-3 py-1.5 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                                            >
                                                View (Read-only)
                                            </button>
                                            {role === "admin" && (
                                                <button
                                                    onClick={() => start(tenant.id, "full")}
                                                    className="px-3 py-1.5 bg-[var(--color-primary)] text-white rounded hover:bg-orange-600 transition-colors"
                                                >
                                                    Impersonate
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </RequireRole>
    );
}
