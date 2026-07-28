import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const activeUser = await getAuthUser(req)

        const event = await prisma.event.findUnique({
            where: { id },
            include: {
                organizer: {
                    select: { name: true, email: true }
                },
                _count: {
                    select: { attendees: true }
                }
            }
        })

        if (!event) {
            return NextResponse.json({ message: 'Event not found' }, { status: 404 })
        }

        // Check if the current user has RSVP'd
        let isRsvped = false
        if (activeUser) {
            const rsvp = await prisma.eventAttendee.findUnique({
                where: { eventId_userId: { eventId: id, userId: activeUser.id } }
            })
            isRsvped = !!rsvp
        }

        return NextResponse.json({ ...event, isRsvped })
    } catch (error) {
        console.error('Error fetching event:', error)
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await getAuthUser(req)
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params

        const event = await prisma.event.findUnique({
            where: { id }
        })

        if (!event) {
            return NextResponse.json({ message: 'Event not found' }, { status: 404 })
        }

        if (event.organizerId !== user.id && user.role !== 'admin') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
        }

        if (user.role === 'admin') {
            await prisma.event.update({
                where: { id },
                data: { status: 'deleted_by_admin' }
            })
            return NextResponse.json({ message: 'Event marked as deleted by admin' })
        }

        await prisma.event.delete({
            where: { id }
        })

        return NextResponse.json({ message: 'Event deleted successfully' })
    } catch (error) {
        console.error('Error deleting event:', error)
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await getAuthUser(req)
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        const body = await req.json()

        const event = await prisma.event.findUnique({
            where: { id }
        })

        if (!event) {
            return NextResponse.json({ message: 'Event not found' }, { status: 404 })
        }

        if (event.organizerId !== user.id && user.role !== 'admin') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
        }

        const { title, date, time, location, description, images, audience, registrationLink } = body

        let eventDate = event.date
        if (date && time) {
            eventDate = new Date(`${date}T${time}:00`)
        } else if (date) {
            eventDate = new Date(date)
        }

        // Admin edits stay approved; member edits reset to pending unless already approved
        const newStatus = user.role === 'admin' || event.status === 'approved' ? event.status : 'pending'

        const updatedEvent = await prisma.event.update({
            where: { id },
            data: {
                title,
                description,
                date: eventDate,
                location,
                images: images !== undefined ? (images || []) : event.images,
                audience: audience !== undefined ? audience : event.audience,
                registrationLink: registrationLink !== undefined ? (registrationLink || null) : event.registrationLink,
                status: newStatus
            }
        })

        return NextResponse.json(updatedEvent)
    } catch (error) {
        console.error('Error updating event:', error)
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        )
    }
}
