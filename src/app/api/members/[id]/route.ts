import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyFirebaseToken } from '@/lib/auth'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const user = await verifyFirebaseToken(req)

        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }

        const currentUserId = user.id

        const member = await prisma.user.findUnique({
            where: { id, status: 'approved' },
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
        })

        if (!member) {
            return NextResponse.json({ message: 'Member not found' }, { status: 404 })
        }

        // Check follow status
        const follow = await prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId: currentUserId,
                    followingId: id,
                }
            }
        })
        const isFollowing = !!follow

        // Get approved postings
        const [jobs, businesses, events] = await Promise.all([
            prisma.job.findMany({
                where: { posterId: id, status: 'approved' },
                orderBy: { createdAt: 'desc' },
                take: 10,
            }),
            prisma.business.findMany({
                where: { ownerId: id, status: 'approved' },
                orderBy: { createdAt: 'desc' },
                take: 10,
            }),
            prisma.event.findMany({
                where: { organizerId: id, status: 'approved' },
                orderBy: { createdAt: 'desc' },
                take: 10,
            }),
        ])

        // Get followers list
        const followers = await prisma.follow.findMany({
            where: { followingId: id },
            select: {
                follower: {
                    select: { id: true, name: true, location: true, profileImage: true }
                }
            },
            take: 20,
        })

        // Get following list
        const following = await prisma.follow.findMany({
            where: { followerId: id },
            select: {
                following: {
                    select: { id: true, name: true, location: true, profileImage: true }
                }
            },
            take: 20,
        })

        return NextResponse.json({
            ...member,
            followerCount: member._count.followers,
            followingCount: member._count.following,
            isFollowing,
            jobs,
            businesses,
            events,
            followers: followers.map((f: any) => f.follower),
            followingList: following.map((f: any) => f.following),
            _count: undefined,
        })
    } catch (error) {
        console.error('Member profile error:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}
