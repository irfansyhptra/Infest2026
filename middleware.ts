import { NextRequest, NextResponse } from 'next/server';
import { getSecurityHeaders } from '@/libs/security/utils';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Add security headers
  const securityHeaders = getSecurityHeaders();
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  // Add additional security measures
  response.headers.set('X-Request-ID', crypto.randomUUID());
  
  // Log suspicious requests (optional)
  const userAgent = request.headers.get('user-agent') || '';
  const origin = request.headers.get('origin') || '';
  
  // Detect potential security threats
  if (userAgent.toLowerCase().includes('bot') && !origin) {
    console.warn('Potential bot access detected:', {
      userAgent,
      url: request.url,
      ip: request.ip
    });
  }
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};