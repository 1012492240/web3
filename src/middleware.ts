import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { headers } from 'next/headers';
import { MAX_REQUESTS_PER_SECOND } from './constants';
import { ExpiringMap } from './utils/expiringMap';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { getEnvironment } from './lib/config';

// In-memory store for rate limiting
const requestCounts = new ExpiringMap<string, number>();
const WINDOW_SIZE_IN_MS = 1000; // 1 second

// Create the next-intl middleware
const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  
  // Skip internationalization for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Handle API test routes in non-development environments
    if (request.nextUrl.pathname.startsWith('/api/test') && getEnvironment() !== 'development') {
      return NextResponse.json(
        { error: 'Test API endpoints are only available in development environment' },
        { status: 403 }
      );
    }
    
    // Rate limiting for API routes
    const headerList = await headers();
    const ip = headerList.get('x-forwarded-for') || headerList.get('x-real-ip') || 'unknown';

    // Initialize or increment request count for this IP
    const currentCount = requestCounts.get(ip) || 0;
    if (currentCount === 0) {
      requestCounts.set(ip, 1, WINDOW_SIZE_IN_MS);
    } else {
      requestCounts.setIfExists(ip, currentCount + 1);
    }

    // Enforce TPS limit
    if (currentCount >= MAX_REQUESTS_PER_SECOND) {
      return NextResponse.json(
        { error: 'Too many requests, please try again later.' },
        { status: 429 }
      );
    }
    
    // For API routes, just proceed with the request (no intl handling)
    return NextResponse.next();
  }
  
  // For non-API routes, apply internationalization
  return intlMiddleware(request);
}

export const config = {

  matcher: ['/((?!favicon|trpc|_next|_vercel|.*\\..*).*)', '/api/:path*']
};