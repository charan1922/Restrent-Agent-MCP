"use client";

import { useAdminAuth } from "@/contexts/AdminAuthContext";
import Link from "next/link";

export default function AdminLogin() {
    const { loginAs } = useAdminAuth();

    const handleLogin = (role: "viewer" | "support" | "admin") => {
        loginAs(role);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h1 className="text-2xl font-bold mb-6">Super‑Admin Portal Login</h1>
            <div className="space-x-4">
                <button
                    onClick={() => handleLogin("viewer")}
                    className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
                >
                    Viewer
                </button>
                <button
                    onClick={() => handleLogin("support")}
                    className="px-4 py-2 bg-blue-300 hover:bg-blue-400 rounded"
                >
                    Support
                </button>
                <button
                    onClick={() => handleLogin("admin")}
                    className="px-4 py-2 bg-green-300 hover:bg-green-400 rounded"
                >
                    Admin
                </button>
            </div>
            <p className="mt-4 text-sm text-gray-600">
                After selecting a role you will be redirected to the admin dashboard.
            </p>
            <Link href="/admin" className="mt-2 text-blue-600 underline">
                Go to Dashboard
            </Link>
        </div>
    );
}
