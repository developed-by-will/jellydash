import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  const token = await getToken({ req });
  const { pathname } = req.nextUrl;

  if (token && pathname === '/') {
    return NextResponse.redirect(new URL('/jd-admin', req.url));
  }

  if (!token && pathname.startsWith('/jd-admin')) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/jd-admin/:path*']
};
