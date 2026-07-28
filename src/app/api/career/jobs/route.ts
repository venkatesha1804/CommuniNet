import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const type = searchParams.get('type')
        const location = searchParams.get('location')
        const searchQuery = searchParams.get('search')
        const filterType = searchParams.get('filter')
        const requestedStatus = searchParams.get('status')

        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '15')
        const skip = (page - 1) * limit

        // Optionally get current user for personalized listing
        const activeUser = await getAuthUser(req)
        const activeUserId = activeUser?.id || null

        const queryConditions: any[] = []

        if (filterType === 'mine' && activeUserId) {
            queryConditions.push({ posterId: activeUserId })
        } else if (requestedStatus) {
            queryConditions.push({ status: requestedStatus })
        } else {
            // Strict enforcement: Approved OR Mine
            if (activeUserId) {
                queryConditions.push({
                    OR: [
                        { status: 'approved' },
                        { posterId: activeUserId, status: { notIn: ['deleted', 'rejected', 'deleted_by_admin'] } }
                    ]
                })
            } else {
                queryConditions.push({ status: 'approved' })
            }
        }

        if (type && type !== 'All') {
            queryConditions.push({ type })
        }

        if (location && location !== 'All') {
            queryConditions.push({ location: { contains: location, mode: 'insensitive' } })
        }

        if (searchQuery) {
            queryConditions.push({
                OR: [
                    { title: { contains: searchQuery, mode: 'insensitive' } },
                    { company: { contains: searchQuery, mode: 'insensitive' } },
                    { location: { contains: searchQuery, mode: 'insensitive' } },
                ]
            })
        }

        const where = queryConditions.length > 0 ? { AND: queryConditions } : {}

        const total = await prisma.job.count({ where })

        const jobs = await prisma.job.findMany({
            where,
            include: {
                poster: { select: { name: true, email: true } }
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit
        })

        return NextResponse.json({
            jobs,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                currentPage: page,
                limit
            }
        })
    } catch (error) {
        console.error('Error fetching jobs:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const user = await getAuthUser(req)
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }

        const userId = user.id
        const userRole = user.role
        const body = await req.json()
        const { title, company, location, type, salary, description, contactEmail, contactPhone, deadline } = body

        if (!title || !company || !location || !type || !description) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
        }

        // Verification Lock: Only approved members or admins can post
        if (user.status !== 'approved' && user.role !== 'admin') {
            return NextResponse.json({
                message: 'Account verification required. Please contact admin to verify your account.'
            }, { status: 403 })
        }

        const status = userRole === 'admin' ? 'approved' : 'pending'

        const job = await prisma.job.create({
            data: {
                posterId: userId,
                title,
                company,
                location,
                type,
                salary: salary || null,
                description,
                contactEmail: contactEmail || null,
                contactPhone: contactPhone || null,
                deadline: deadline ? new Date(deadline) : null,
                status,
            }
        })

        if (status === 'approved') {
            const { broadcastNotification } = await import('@/lib/notifications')
            await broadcastNotification(
                "New Job Opportunity",
                `A new job "${job.title}" at ${job.company} has been posted.`,
                "job",
                "/career?tab=jobs"
            )
        }

        return NextResponse.json(job, { status: 201 })
    } catch (error) {
        console.error('Error creating job:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}
