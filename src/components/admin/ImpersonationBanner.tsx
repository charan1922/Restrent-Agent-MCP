"use client";

import { useAdminImpersonation } from "@/contexts/AdminImpersonationContext";
import { useEffect, useState } from "react";

export default function ImpersonationBanner() {
    const { state, exit } = useAdminImpersonation();
    const [remaining, setRemaining] = useState<number>(0);

    useEffect(() => {
        if (!state.expiresAt) return;
        const update = () => setRemaining(state.expiresAt! - Date.now());
        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, [state.expiresAt]);

    if (!state.tenantId) return null;

    const minutes = Math.max(0, Math.floor(remaining / 60000));
    const seconds = Math.max(0, Math.floor((remaining % 60000) / 1000));

    return (
        <div className="fixed top-0 left-0 right-0 bg-orange-100 border-b border-orange-300 text-orange-800 p-2 flex items-center justify-between z-50">
            <span>
                Impersonating tenant <strong>{state.tenantId}</strong> ({state.mode}) – expires in {minutes}m {seconds}s
            </span>
            <button
                onClick={exit}
                className="px-3 py-1 bg-orange-300 hover:bg-orange-400 text-sm rounded"
            >
                Exit Impersonation
            </button>
        </div>
    );
}
