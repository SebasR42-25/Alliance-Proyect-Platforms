import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rutas públicas — no requieren autenticación
const PUBLIC_PATHS = ['/login', '/register'];

// En Next.js 16, el archivo se llama proxy.ts en lugar de middleware.ts
export const proxy = auth((req: NextRequest & { auth: unknown }) => {
  const { nextUrl }   = req;
  const isLoggedIn    = !!(req as { auth: unknown }).auth;
  const isPublicPath  = PUBLIC_PATHS.some((p) => nextUrl.pathname.startsWith(p));

  if (!isLoggedIn && !isPublicPath) {
    const loginUrl = new URL('/login', nextUrl.origin);
    loginUrl.searchParams.set('callbackUrl', nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoggedIn && isPublicPath) {
    return NextResponse.redirect(new URL('/', nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
