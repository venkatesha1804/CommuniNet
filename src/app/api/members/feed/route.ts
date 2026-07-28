import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function GET(req: Request) {
    try {
        const user = await getAuthUser(req)
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

        const follows = await prisma.follow.findMany({
            where: { followerId: user.id },
            select: { followingId: true },
        })
        const followingIds = follows.map((f: { followingId: string }) => f.followingId)

        if (followingIds.length === 0) {
            return NextResponse.json({ feed: [], message: 'Follow some members to see their activity!' })
        }

        const [jobs, businesses, events, scholarships, mentorships] = await Promise.all([
            prisma.job.findMany({
                where: { posterId: { in: followingIds }, status: 'approved' },
                include: { poster: { select: { id: true, name: true, email: true } } },
                orderBy: { createdAt: 'desc' }, take: 20,
            }),
            prisma.business.findMany({
                where: { ownerId: { in: followingIds }, status: 'approved' },
                include: { owner: { select: { id: true, name: true, email: true } } },
                orderBy: { createdAt: 'desc' }, take: 20,
            }),
            prisma.event.findMany({
                where: { organizerId: { in: followingIds }, status: 'approved' },
                include: { organizer: { select: { id: true, name: true, email: true } } },
                orderBy: { createdAt: 'desc' }, take: 20,
            }),
            prisma.scholarship.findMany({
                where: { posterId: { in: followingIds }, status: 'approved' },
                include: { poster: { select: { id: true, name: true, email: true } } },
                orderBy: { createdAt: 'desc' }, take: 20,
            }),
            prisma.mentorship.findMany({
                where: { mentorId: { in: followingIds }, status: 'approved' },
                include: { mentor: { select: { id: true, name: true, email: true } } },
                orderBy: { createdAt: 'desc' }, take: 10,
            }),
        ])

        const feed = [
            ...jobs.map((j: any) => ({ type: 'job' as const, id: j.id, title: j.title, subtitle: j.company, user: j.poster, createdAt: j.createdAt })),
            ...businesses.map((b: any) => ({ type: 'business' as const, id: b.id, title: b.name, subtitle: b.category, user: b.owner, createdAt: b.createdAt })),
            ...events.map((e: any) => ({ type: 'event' as const, id: e.id, title: e.title, subtitle: e.location, user: e.organizer, createdAt: e.createdAt })),
            ...scholarships.map((s: any) => ({ type: 'scholarship' as const, id: s.id, title: s.title, subtitle: s.amount, user: s.poster, createdAt: s.createdAt })),
            ...mentorships.map((m: any) => ({ type: 'mentorship' as const, id: m.id, title: `Mentor: ${m.mentor.name || m.mentor.email}`, subtitle: m.expertise, user: m.mentor, createdAt: m.createdAt })),
        ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 50)

        return NextResponse.json({ feed })
    } catch (error) {
        console.error('Feed error:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}
