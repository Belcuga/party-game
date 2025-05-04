import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  console.log('✅ Middleware is running for:', request.nextUrl.pathname);

  const isLocal = process.env.NODE_ENV === 'development';

  if (!isLocal && request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],  // ✅ required for root middleware
};