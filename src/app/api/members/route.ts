import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyFirebaseToken } from '@/lib/auth'

export async function GET(req: Request) {
    try {
        const user = await verifyFirebaseToken(req)

        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }

        const currentUserId = user.id
        const { searchParams } = new URL(req.url)
        const search = searchParams.get('search') || ''
        const page = parseInt(searchParams.get('page') || '1')
        const limitParam = parseInt(searchParams.get('limit') || '20')
        const limit = Math.min(Math.max(limitParam, 1), 50)

        // Only show approved members, exclude current user
        const where: any = {
            status: 'approved',
            role: { not: 'admin' },
            ...(currentUserId ? { id: { not: currentUserId } } : {}),
        }

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { location: { contains: search, mode: 'insensitive' } },
                { gotra: { contains: search, mode: 'insensitive' } },
            ]
        }

        const [members, total] = await Promise.all([
            prisma.user.findMany({
                where,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    location: true,
                    gotra: true,
                    bio: true,
                    profileImage: true,
                    createdAt: true,
                    _count: {
                        select: {
                            followers: true,
                            following: true,
                        }
                    },
                },
                orderBy: { name: 'asc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.user.count({ where }),
        ])

        // If logged in, check which members the current user follows
        let followingIds: string[] = []
        if (currentUserId) {
            const follows = await prisma.follow.findMany({
                where: { followerId: currentUserId },
                select: { followingId: true },
            })
            followingIds = follows.map((f: { followingId: string }) => f.followingId)
        }

        const membersWithFollowStatus = members.map((m: any) => ({
            ...m,
            followerCount: m._count.followers,
            followingCount: m._count.following,
            isFollowing: followingIds.includes(m.id),
            _count: undefined,
        }))

        return NextResponse.json({
            members: membersWithFollowStatus,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        })
    } catch (error) {
        console.error('Members list error:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}
