import { NextRequest } from "next/server";

/**
 * Server-side utility to extract tenant ID from request
 * Reads from middleware-injected header with fallback to environment variable
 * 
 * @param request - Next.js request object
 * @returns Tenant ID string
 * 
 * @example
 * ```ts
 * export async function GET(request: NextRequest) {
 *   const tenantId = getTenantId(request);
 *   // Use tenantId for DB queries
 * }
 * ```
 */
export function getTenantId(request: NextRequest): string | null {
  return request.headers.get('x-tenant-id') || process.env.TENANT_ID || null;
}

/**
 * Server-side utility to extract tenant name from request
 * Reads from middleware-injected header with fallback to environment variable
 * 
 * @param request - Next.js request object
 * @returns Tenant name string
 */
export function getTenantName(request: NextRequest): string {
  return request.headers.get('x-tenant-name') || process.env.TENANT_NAME || 'Restaurant';
}

/**
 * Server-side utility to get both tenant ID and name
 * 
 * @param request - Next.js request object
 * @returns Object with tenantId and tenantName
 */
export function getTenantInfo(request: NextRequest): { tenantId: string | null; tenantName: string } {
  return {
    tenantId: getTenantId(request),
    tenantName: getTenantName(request),
  };
}
