import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { adminAuth } from '@/lib/firebase-admin'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { name, email, password, mobile, gotra, firebaseUid } = body as {
            name?: string;
            email?: string;
            password?: string;
            mobile?: string;
            gotra?: string;
            firebaseUid?: string;
        }

        if (!email || !mobile || !firebaseUid) {
            return NextResponse.json(
                { message: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Verify Firebase Token if provided
        const authHeader = req.headers.get('Authorization')
        if (authHeader?.startsWith('Bearer ')) {
            const token = authHeader.split('Bearer ')[1]
            const decodedToken = await adminAuth.verifyIdToken(token)
            if (decodedToken.uid !== firebaseUid) {
                return NextResponse.json({ message: 'Token mismatch' }, { status: 401 })
            }
        }

        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { mobile },
                    { firebaseUid }
                ]
            }
        })

        if (existingUser) {
            return NextResponse.json(
                { message: 'User already exists' },
                { status: 409 }
            )
        }

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: 'FIREBASE_AUTH', // Placeholder
                mobile,
                gotra,
                firebaseUid,
                role: 'member',
                status: 'pending',
            }
        })

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _p, ...userWithoutPassword } = user

        return NextResponse.json(
            { message: 'User created successfully', user: userWithoutPassword },
            { status: 201 }
        )
    } catch (error) {
        console.error('Registration error:', error)
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        )
    }
}
