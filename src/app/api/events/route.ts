import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const requestedStatus = searchParams.get('status')
        const filter = searchParams.get('filter') // 'upcoming', 'past', or 'all'

        // Pagination logic
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '15')
        const skip = (page - 1) * limit

        // Get current user if logged in (optional)
        const activeUser = await getAuthUser(req)
        const activeUserId = activeUser?.id || null

        const queryConditions: any[] = []
        const filterStatus = searchParams.get('filter') // 'upcoming', 'past', or 'all'
        const viewMode = searchParams.get('mode') // 'all' or 'mine'

        // Status Logic
        if (viewMode === 'mine' && activeUserId) {
            // For admins: show events they organized
            // For members: show only events they are attending (RSVP'd)
            const activeUserRole = activeUser?.role || 'member'
            if (activeUserRole === 'admin') {
                queryConditions.push({ organizerId: activeUserId })
            } else {
                queryConditions.push({
                    attendees: { some: { userId: activeUserId } }
                })
            }
        } else if (requestedStatus) {
            queryConditions.push({ status: requestedStatus })
        } else {
            // Strict enforcement: Approved OR Mine (but not deleted_by_admin in main feed)
            if (activeUserId) {
                queryConditions.push({
                    OR: [
                        { status: 'approved' },
                        { organizerId: activeUserId, status: { notIn: ['deleted', 'rejected', 'deleted_by_admin'] } }
                    ]
                })
            } else {
                queryConditions.push({ status: 'approved' })
            }
        }

        // Filter Logic (Server-side date filtering)
        const now = new Date()
        if (filter === 'upcoming') {
            queryConditions.push({ date: { gte: now } })
        } else if (filter === 'past') {
            queryConditions.push({ date: { lt: now } })
        }
        // 'all' or undefined does nothing extra

        // Get Total Count
        const total = await prisma.event.count({
            where: queryConditions.length > 0 ? { AND: queryConditions } : {}
        })

        const events = await prisma.event.findMany({
            where: queryConditions.length > 0 ? { AND: queryConditions } : {},
            include: {
                organizer: {
                    select: { name: true, email: true }
                },
                _count: {
                    select: { attendees: true }
                }
            },
            orderBy: { date: filter === 'past' ? 'desc' : 'asc' }, // Past events usually newest first? Or oldest? Actually user might want closest past event. 'desc' puts recent past first. 'asc' puts old past first.
            skip,
            take: limit
        })

        return NextResponse.json({
            data: events,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                currentPage: page,
                limit
            }
        })
    } catch (error) {
        console.error('Error fetching events:', error)
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function POST(req: Request) {
    try {
        console.log('Event POST request received')
        const user = await getAuthUser(req)
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }

        const userId = user.id
        const userRole = user.role

        const body = await req.json()
        console.log('Event POST body:', body)

        const { title, date, time, location, description, images, audience, registrationLink } = body

        if (!title || !date || !time || !location || !description) {
            return NextResponse.json(
                { message: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Combine date and time
        const eventDate = new Date(`${date}T${time}:00`)

        // Admin-created events are auto-approved, member events are pending
        const eventStatus = userRole === 'admin' ? 'approved' : 'pending'

        const newEvent = await prisma.event.create({
            data: {
                organizerId: userId,
                title,
                description,
                date: eventDate,
                location,
                images: images || [],
                audience: audience || 'public',
                registrationLink: registrationLink || null,
                status: eventStatus
            }
        })

        if (eventStatus === 'approved') {
            const { broadcastNotification } = await import('@/lib/notifications')
            const dateStr = new Date(newEvent.date).toLocaleDateString()
            await broadcastNotification(
                "New Event Announced",
                `The event "${newEvent.title}" is scheduled for ${dateStr}.`,
                "event",
                `/events/${newEvent.id}`
            )
        }

        return NextResponse.json(newEvent, { status: 201 })
    } catch (error) {
        console.error('Error creating event:', error)
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        )
    }
}
