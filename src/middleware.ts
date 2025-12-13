import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Subdomain-based tenant detection middleware
 * Extracts tenant from subdomain and adds to request headers
 */
export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  
  // Extract subdomain from host
  // Examples:
  // - pistahouse.waiter.local:4444 -> pistahouse
  // - chutneys.waiter.local:4444 -> chutneys
  // - localhost:4444 -> fallback to pista-house
  
  let tenantId = 'tenant-pista-house'; // Default fallback
  let tenantName = 'Pista House Restaurant';
  
  // Extract subdomain (first part before the first dot)
  const subdomain = host.split('.')[0].split(':')[0];
  
  // Map subdomain to tenant
  if (subdomain === 'pistahouse') {
    tenantId = 'tenant-pista-house';
    tenantName = 'Pista House Restaurant';
  } else if (subdomain === 'chutneys') {
    tenantId = 'tenant-chutneys';
    tenantName = 'Chutneys Restaurant';
  } else if (subdomain === 'localhost' || subdomain === '127') {
    // Localhost access - default to pista-house
    tenantId = 'tenant-pista-house';
    tenantName = 'Pista House Restaurant';
  }
  
  // Clone the request headers and add tenant information
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-tenant-id', tenantId);
  requestHeaders.set('x-tenant-name', tenantName);
  
  // Log for debugging (remove in production)
  console.log(`[Middleware] Host: ${host} -> Tenant: ${tenantId}`);
  
  // Return response with modified headers
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// Configure middleware to run on all routes except static files
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.svg).*)',
  ],
};
