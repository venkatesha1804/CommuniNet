import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { signJWT } from '@/lib/auth'

export async function POST(req: Request) {
    try {
        const { identifier, password } = (await req.json()) as {
            identifier?: string;
            password?: string;
        } // identifier can be email or mobile

        if (!identifier || !password) {
            return NextResponse.json(
                { message: 'Missing required fields' },
                { status: 400 }
            )
        }

        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: identifier },
                    { mobile: identifier }
                ]
            }
        })

        if (!user) {
            return NextResponse.json(
                { message: 'Invalid credentials' },
                { status: 401 }
            )
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)

        if (!isPasswordValid) {
            return NextResponse.json(
                { message: 'Invalid credentials' },
                { status: 401 }
            )
        }

        // Check if user is verified (Optional: Add warning or restrictions here instead of blocking)
        // if (user.status !== 'approved' && user.role !== 'admin') {
        //     // Allow login, but UI will show "Unverified"
        // }

        const token = await signJWT({
            sub: user.id,
            role: user.role,
            name: user.name,
            email: user.email // Added email for API verification
        })

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _p, ...userWithoutPassword } = user

        console.log('[Login] Successful, setting auth_token cookie for user:', user.id);
        const response = NextResponse.json(
            { message: 'Login successful', user: userWithoutPassword },
            { status: 200 }
        )
        // Set HTTP-only cookie
        response.cookies.set({
            name: 'auth_token',
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 // 1 day
        })

        return response

    } catch (error) {
        console.error('Login error:', error)
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        )
    }
}
