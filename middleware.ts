import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const isLocal = process.env.NODE_ENV === 'development';

  // Only block if NOT local
  if (!isLocal && request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*'],
  };