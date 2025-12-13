"use client";

import { useEffect, useState } from "react";

interface TenantInfo {
  tenantName: string;
  primaryColor: string;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook to get current tenant information from the theme API
 * The tenant is determined by the subdomain (via middleware)
 * 
 * @returns {TenantInfo} Tenant name, primary color, loading state, and error
 * 
 * @example
 * ```tsx
 * const { tenantName, primaryColor, isLoading } = useTenant();
 * 
 * return <h1 style={{ color: primaryColor }}>{tenantName}</h1>
 * ```
 */
export function useTenant(): TenantInfo {
  const [tenantInfo, setTenantInfo] = useState<TenantInfo>({
    tenantName: "Restaurant",
    primaryColor: "#EA580C",
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const fetchTenantInfo = async () => {
      try {
        const response = await fetch("/api/theme");
        
        if (!response.ok) {
          throw new Error(`Failed to fetch tenant info: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (data.success && data.theme) {
          setTenantInfo({
            tenantName: data.theme.tenantName || "Restaurant",
            primaryColor: data.theme.primaryColor || "#EA580C",
            isLoading: false,
            error: null,
          });
        } else {
          throw new Error("Invalid response from theme API");
        }
      } catch (error) {
        console.error("Error fetching tenant info:", error);
        setTenantInfo((prev) => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : "Unknown error",
        }));
      }
    };

    fetchTenantInfo();
  }, []);

  return tenantInfo;
}
