import crypto from 'node:crypto'

export const adminSessionCookieName = 'admin_session'

function getAdminSecret () {
  const secret = process.env.ADMIN_SECRET
  if (!secret) {
    throw new Error('Missing ADMIN_SECRET in environment variables')
  }

  return secret
}

function sign (payload: string, secret: string) {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex')
}

function safeEqual (a: string, b: string) {
  const aBuffer = Buffer.from(a)
  const bBuffer = Buffer.from(b)

  if (aBuffer.length !== bBuffer.length) {
    return false
  }

  return crypto.timingSafeEqual(aBuffer, bBuffer)
}

export function createAdminSessionValue () {
  const secret = getAdminSecret()
  const payload = String(Date.now())
  const signature = sign(payload, secret)

  return `${payload}.${signature}`
}

export function isAdminSessionValid (cookieValue?: string) {
  if (!cookieValue) {
    return false
  }

  const secret = getAdminSecret()
  const [payload, signature] = cookieValue.split('.')

  if (!payload || !signature) {
    return false
  }

  const expected = sign(payload, secret)
  return safeEqual(signature, expected)
}
