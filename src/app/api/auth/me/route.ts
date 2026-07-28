import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { adminAuth } from '@/lib/firebase-admin'
import { getAuthUser } from '@/lib/auth'

export async function GET(req: Request) {
    try {
        const authUser = await getAuthUser(req)

        if (!authUser) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }

        // Fetch full user data including profileImage and other profile fields
        const user = await prisma.user.findUnique({
            where: { id: authUser.id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                status: true,
                mobile: true,
                gotra: true,
                location: true,
                bio: true,
                profileImage: true,
                familyMembers: true,
            } as any
        })

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 })
        }

        return NextResponse.json({ user }, { status: 200 })
    } catch (error) {
        console.error('Auth check error:', error)
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
}
