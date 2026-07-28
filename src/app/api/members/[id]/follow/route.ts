import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: followingId } = await params
        const user = await getAuthUser(req)
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

        const followerId = user.id

        if (followerId === followingId) {
            return NextResponse.json({ message: 'Cannot follow yourself' }, { status: 400 })
        }

        const targetUser = await prisma.user.findUnique({ where: { id: followingId, status: 'approved' } })
        if (!targetUser) return NextResponse.json({ message: 'User not found' }, { status: 404 })

        const existing = await prisma.follow.findUnique({
            where: { followerId_followingId: { followerId, followingId } }
        })
        if (existing) {
            return NextResponse.json({ message: 'Already following' }, { status: 409 })
        }

        await prisma.follow.create({ data: { followerId, followingId } })

        return NextResponse.json({ message: 'Followed successfully' })
    } catch (error) {
        console.error('Follow error:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: followingId } = await params
        const user = await getAuthUser(req)
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

        await prisma.follow.deleteMany({ where: { followerId: user.id, followingId } })

        return NextResponse.json({ message: 'Unfollowed successfully' })
    } catch (error) {
        console.error('Unfollow error:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}
