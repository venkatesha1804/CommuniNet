import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const user = await getAuthUser(req)
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

        const event = await prisma.event.findUnique({ where: { id } })
        if (!event) return NextResponse.json({ message: 'Event not found' }, { status: 404 })

        const existingRSVP = await prisma.eventAttendee.findUnique({
            where: { eventId_userId: { eventId: id, userId: user.id } }
        })

        if (existingRSVP) {
            await prisma.eventAttendee.delete({
                where: { eventId_userId: { eventId: id, userId: user.id } }
            })
            const count = await prisma.eventAttendee.count({ where: { eventId: id } })
            return NextResponse.json({ message: 'RSVP removed', status: 'not_attending', attendeeCount: count })
        } else {
            await prisma.eventAttendee.create({ data: { eventId: id, userId: user.id } })
            const count = await prisma.eventAttendee.count({ where: { eventId: id } })
            return NextResponse.json({ message: 'RSVP successful', status: 'attending', attendeeCount: count })
        }
    } catch (error) {
        console.error('Error toggling RSVP:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}
