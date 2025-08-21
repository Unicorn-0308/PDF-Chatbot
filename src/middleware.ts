import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/signup', '/api/auth/login', '/api/auth/signup']
  const isPublicRoute = publicRoutes.includes(pathname)

  // Protected routes
  const adminRoutes = ['/admin', '/api/admin']
  const userRoutes = ['/chat']
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route))
  const isUserRoute = userRoutes.some(route => pathname.startsWith(route))

  // If no token and trying to access protected route, redirect to login
  if (!token && (isAdminRoute || isUserRoute)) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If has token and trying to access login or signup page, redirect based on role
  if (token && (pathname === '/login' || pathname === '/signup')) {
    // For demo, we'll decode the base64 token to get the role
    try {
      const decoded = JSON.parse(Buffer.from(token.value, 'base64').toString())
      if (decoded.role === 'admin') {
        return NextResponse.redirect(new URL('/admin', request.url))
      } else {
        return NextResponse.redirect(new URL('/chat', request.url))
      }
    } catch (e) {
      // If token is invalid, continue to login/signup page
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
