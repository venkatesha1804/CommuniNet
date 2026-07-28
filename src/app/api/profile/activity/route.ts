import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
    try {
        const user = await getAuthUser(req)
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

        const profileUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: {
                id: true,
                jobs: { select: { id: true, title: true, company: true, location: true, status: true, createdAt: true }, orderBy: { createdAt: 'desc' }, take: 10 },
                businesses: { select: { id: true, name: true, category: true, city: true, status: true, createdAt: true }, orderBy: { createdAt: 'desc' }, take: 10 },
                events: { select: { id: true, title: true, date: true, location: true, status: true, createdAt: true }, orderBy: { createdAt: 'desc' }, take: 10 },
                scholarships: { select: { id: true, title: true, amount: true, type: true, status: true, createdAt: true }, orderBy: { createdAt: 'desc' }, take: 10 },
                mentorships: { select: { id: true, expertise: true, bio: true, available: true, status: true, createdAt: true }, orderBy: { createdAt: 'desc' }, take: 10 },
                achievements: { select: { id: true, title: true, category: true, description: true, status: true, createdAt: true }, orderBy: { createdAt: 'desc' }, take: 10 }
            }
        })

        if (!profileUser) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 })
        }

        return NextResponse.json(profileUser)
    } catch (error) {
        console.error('Error fetching profile activity:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}
