import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { adminSessionCookieName, createAdminSessionValue } from '@/lib/admin-auth'

function getAdminSecret () {
  const secret = process.env.ADMIN_SECRET
  if (!secret) {
    throw new Error('Missing ADMIN_SECRET in environment variables')
  }

  return secret
}

function isValidSecret (inputSecret: string) {
  return inputSecret === getAdminSecret()
}

async function readSecretFromRequest (request: NextRequest) {
  const contentType = request.headers.get('content-type') || ''

  if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
    const formData = await request.formData()
    const secret = formData.get('secret')
    return typeof secret === 'string' ? secret : ''
  }

  const body = await request.json().catch(() => ({}))
  return typeof body.secret === 'string' ? body.secret : ''
}

export async function POST (request: NextRequest) {
  try {
    const secret = await readSecretFromRequest(request)

    if (!isValidSecret(secret)) {
      return NextResponse.redirect(new URL('/admin/login?error=1', request.url))
    }

    const response = NextResponse.redirect(new URL('/admin', request.url))

    response.cookies.set({
      name: adminSessionCookieName,
      value: createAdminSessionValue(),
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7
    })

    return response
  } catch (error) {
    console.error('[Admin Login] Failed:', error)
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }
}
