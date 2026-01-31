import { NextRequest } from 'next/server'
import { prisma } from './prisma'

/**
 * Validates the API token from the request headers
 * Token should be passed as: Authorization: Bearer <token>
 */
export function validateApiToken(request: NextRequest): boolean {
  const authHeader = request.headers.get('Authorization')
  
  if (!authHeader) {
    return false
  }
  
  const [type, token] = authHeader.split(' ')
  
  if (type !== 'Bearer' || !token) {
    return false
  }
  
  const validToken = process.env.API_TOKEN
  
  if (!validToken) {
    console.error('API_TOKEN not configured in environment')
    return false
  }
  
  return token === validToken
}

/**
 * Validates the Better Auth session cookie against the database.
 */
export async function validateSessionCookie(request: NextRequest): Promise<boolean> {
  const sessionToken = request.cookies.get('better-auth.session_token')?.value
  if (!sessionToken) return false

  const session = await prisma.session.findUnique({
    where: { token: sessionToken },
    select: { expiresAt: true },
  })

  if (!session) return false
  return session.expiresAt > new Date()
}

/**
 * Authorize either via API token or session cookie.
 * In development, allow same-origin requests without auth for easier local testing.
 */
export async function authorizeRequest(request: NextRequest): Promise<boolean> {
  if (validateApiToken(request)) return true
  if (await validateSessionCookie(request)) return true

  // Allow unauthenticated same-origin requests in development
  if (process.env.NODE_ENV === 'development') {
    const origin = request.headers.get('origin')
    const host = request.headers.get('host')
    // Allow requests from the same host (browser fetch from the app itself)
    // Check for localhost variants: localhost, 127.0.0.1, or matching host
    if (!origin ||
        origin.includes('localhost') ||
        origin.includes('127.0.0.1') ||
        (host && origin.includes(host))) {
      return true
    }
  }

  return false
}

/**
 * Returns an unauthorized response
 */
export function unauthorizedResponse() {
  return Response.json(
    { error: 'Unauthorized', message: 'Invalid or missing API token' },
    { status: 401 }
  )
}
