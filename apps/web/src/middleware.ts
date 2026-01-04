import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtDecode } from "jwt-decode";
import { User } from './types/auth';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value
  const { pathname } = request.nextUrl

  // Define paths
  const authRoutes = ['/login', '/signup', '/forgot-password']
  const protectedRoutes = [
    '/my-bookings',
    '/my-tickets',
    '/profile',
    '/booking',
  ]
  const adminRoutes = ['/admin']

  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route))

  // 1. Redirect logged-in users away from auth pages
  // DISABLED: To prevent redirect loops if client/server state is out of sync.
  // if (isAuthRoute && token) {
  //   try {
  //     const decoded = jwtDecode<any>(token);
  //     const currentTime = Date.now() / 1000;
  //     // Only redirect if token is valid and not expired
  //     if (decoded.exp > currentTime) {
  //       return NextResponse.redirect(new URL('/', request.url))
  //     }
  //   } catch (error) { }
  // }

  // 2. Redirect non-logged-in users trying to access protected pages
  if ((isProtectedRoute || isAdminRoute) && !token) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // 3. Protect Admin Routes
  if (isAdminRoute && token) {
    try {
      const decoded = jwtDecode<User>(token);
      if (decoded.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/', request.url))
      }
    } catch (error) {
       // Invalid token
       return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
