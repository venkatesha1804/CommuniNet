import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function GET(req: Request) {
    try {
        const user = await getAuthUser(req)
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

        const rsvps = await prisma.eventAttendee.findMany({
            where: { userId: user.id },
            select: { eventId: true }
        })

        return NextResponse.json(rsvps.map(r => r.eventId))
    } catch (error) {
        console.error('Error fetching RSVPs:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}
