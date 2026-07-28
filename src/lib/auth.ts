import { SignJWT, jwtVerify, JWTPayload } from 'jose'
import { adminAuth } from './firebase-admin'
import { prisma } from './prisma'

const secretKey = process.env.JWT_SECRET || 'your-secret-key-change-in-prod'
const key = new TextEncoder().encode(secretKey)

export async function signJWT(payload: JWTPayload) {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(key)
}

export async function verifyJWT(token: string) {
    try {
        const { payload } = await jwtVerify(token, key, {
            algorithms: ['HS256'],
        })
        return payload
    } catch (error) {
        return null
    }
}

export async function verifyFirebaseToken(req: Request) {
    try {
        const authHeader = req.headers.get('Authorization')
        if (!authHeader?.startsWith('Bearer ')) return null

        const token = authHeader.split('Bearer ')[1]
        const decodedToken = await adminAuth.verifyIdToken(token)
        if (!decodedToken) return null

        const user = await prisma.user.findFirst({
            where: {
                firebaseUid: decodedToken.uid
            }
        })

        return user
    } catch (error) {
        console.error('Firebase token verification failed', error)
        return null
    }
}

/**
 * Unified auth helper: checks Firebase Bearer token first, then falls back
 * to the old JWT cookie. Returns the user and role, or null if unauthenticated.
 */
export async function getAuthUser(req: Request): Promise<{ id: string; role: string; name: string | null; status: string } | null> {
    // 1. Try Firebase Bearer token (new method)
    try {
        const authHeader = req.headers.get('Authorization')
        if (authHeader?.startsWith('Bearer ')) {
            const token = authHeader.split('Bearer ')[1]
            const decodedToken = await adminAuth.verifyIdToken(token)
            if (decodedToken) {
                const user = await prisma.user.findFirst({
                    where: { firebaseUid: decodedToken.uid },
                    select: { id: true, role: true, name: true, status: true }
                })
                if (user) return user as any
            }
        }
    } catch (_) { /* fall through */ }

    // 2. Fall back to JWT cookie (legacy method)
    try {
        const { cookies } = await import('next/headers')
        const cookieStore = await cookies()
        const token = cookieStore.get('auth_token')?.value
        if (token) {
            console.log('[Auth] Found auth_token cookie');
            const payload = await verifyJWT(token)
            if (payload?.sub) {
                const user = await prisma.user.findFirst({
                    where: { id: payload.sub as string },
                    select: { id: true, role: true, name: true, status: true }
                })
                if (user) {
                    console.log('[Auth] Cookie verification successful for user:', user.id);
                    return user as any
                } else {
                    console.warn('[Auth] User not found in DB for sub:', payload.sub);
                }
            } else {
                console.warn('[Auth] JWT payload missing sub:', payload);
            }
        } else {
            console.log('[Auth] No auth_token cookie found');
        }
    } catch (err) {
        console.error('[Auth] Error during legacy auth fallback:', err);
    }

    return null
}
