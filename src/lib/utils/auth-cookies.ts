/**
 * Auth Cookie Utilities
 * Centralized cookie management for multi-tenant authentication
 */

/**
 * Get the tenant-specific cookie name for auth tokens
 */
export function getAuthCookieName(tenantId?: string): string {
  if (!tenantId) {
    return 'auth_token';
  }
  
  // Convert "tenant-pista-house" to "pista-house"
  const tenantSlug = tenantId.replace('tenant-', '');
  return `auth_token_${tenantSlug}`;
}

/**
 * Get the current tenant's cookie name from environment
 */
export function getCurrentTenantCookieName(): string {
  const tenantId = process.env.TENANT_ID;
  return getAuthCookieName(tenantId);
}
