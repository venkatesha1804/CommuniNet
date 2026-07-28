import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const expertise = searchParams.get('expertise')
        const location = searchParams.get('location')
        const search = searchParams.get('search')
        const filter = searchParams.get('filter')

        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '15')
        const skip = (page - 1) * limit

        const user = await getAuthUser(req)
        const userId = user?.id || null

        const where: any = {}

        if (filter === 'mine' && userId) {
            where.mentorId = userId
        } else if (userId) {
            where.OR = [
                { status: 'approved' },
                { mentorId: userId, status: { notIn: ['deleted', 'rejected'] } }
            ]
        } else {
            where.status = 'approved'
        }

        if (expertise && expertise !== 'All') where.expertise = expertise
        if (location && location !== 'All') {
            where.mentor = { location: { contains: location, mode: 'insensitive' } }
        }
        if (search) {
            where.AND = [...(where.AND || []), {
                OR: [
                    { bio: { contains: search, mode: 'insensitive' } },
                    { expertise: { contains: search, mode: 'insensitive' } },
                    { mentor: { name: { contains: search, mode: 'insensitive' } } },
                ]
            }]
        }

        const total = await prisma.mentorship.count({ where })
        const mentors = await prisma.mentorship.findMany({
            where,
            include: { mentor: { select: { id: true, name: true, email: true, location: true, profileImage: true } } },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit
        })

        let result: any[] = mentors
        if (userId) {
            const requests = await prisma.mentorshipRequest.findMany({
                where: { requesterId: userId, mentorshipId: { in: mentors.map(m => m.id) } },
                select: { mentorshipId: true, status: true }
            })
            const requestMap = new Map(requests.map(r => [r.mentorshipId, r.status]))
            result = mentors.map(m => ({ ...m, hasRequested: requestMap.has(m.id), requestStatus: requestMap.get(m.id) }))
        }

        return NextResponse.json({
            mentors: result,
            pagination: { total, pages: Math.ceil(total / limit), currentPage: page, limit }
        })
    } catch (error) {
        console.error('Error fetching mentors:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const user = await getAuthUser(req)
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

        const body = await req.json()
        const { expertise, bio } = body

        if (!expertise || !bio) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
        }

        // Verification Lock: Only approved members or admins can register as mentors
        if (user.status !== 'approved' && user.role !== 'admin') {
            return NextResponse.json({
                message: 'Account verification required. Please contact admin to verify your account.'
            }, { status: 403 })
        }

        const existing = await prisma.mentorship.findFirst({ where: { mentorId: user.id } })
        if (existing) {
            return NextResponse.json({ message: 'You are already registered as a mentor' }, { status: 409 })
        }

        const mentorship = await prisma.mentorship.create({
            data: {
                mentorId: user.id,
                expertise,
                bio,
                status: user.role === 'admin' ? 'approved' : 'pending',
            }
        })

        return NextResponse.json(mentorship, { status: 201 })
    } catch (error) {
        console.error('Error creating mentorship:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}
