import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { adminSessionCookieName } from '@/lib/admin-auth'

export async function POST (request: NextRequest) {
  const response = NextResponse.redirect(new URL('/admin/login', request.url))

  response.cookies.set({
    name: adminSessionCookieName,
    value: '',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0
  })

  return response
}

export async function GET (request: NextRequest) {
  return POST(request)
}
