import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createNotification, broadcastNotification } from '@/lib/notifications'

// GET all accommodations for admin moderation (can filter by status e.g., ?status=pending)
export async function GET(req: Request) {
    try {
        const user = await getAuthUser(req)
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const status = searchParams.get('status')

        const whereClause = status ? { status } : {}

        const accommodations = await prisma.accommodation.findMany({
            where: whereClause,
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(accommodations)
    } catch (error) {
        console.error('Error fetching admin accommodations:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}

// PATCH an accommodation's status (Approve/Reject)
export async function PATCH(req: Request) {
    try {
        const user = await getAuthUser(req)
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')
        if (!id) return NextResponse.json({ message: 'Accommodation ID is required' }, { status: 400 })

        const body = await req.json()
        const { status } = body

        if (!status || !['approved', 'rejected', 'pending'].includes(status)) {
            return NextResponse.json({ message: 'Invalid status' }, { status: 400 })
        }

        const updatedAccommodation = await prisma.accommodation.update({
            where: { id },
            data: { status }
        })

        // Send notifications based on the new status
        if (status === 'approved') {
            // 1. Notify the owner
            await createNotification(
                updatedAccommodation.ownerId,
                'Listing Approved!',
                `Your accommodation listing for "${updatedAccommodation.name}" has been approved and is now live.`,
                'accommodation',
                `/accommodations/${updatedAccommodation.id}`
            )
            // 2. Broadcast to community
            await broadcastNotification(
                'New verified accommodation available!',
                `A new ${updatedAccommodation.type} "${updatedAccommodation.name}" is now available in ${updatedAccommodation.location}.`,
                'accommodation',
                `/accommodations/${updatedAccommodation.id}`
            )
        } else if (status === 'rejected') {
            await createNotification(
                updatedAccommodation.ownerId,
                'Listing Rejected',
                `Your accommodation listing for "${updatedAccommodation.name}" could not be approved. Please contact an admin for details.`,
                'system'
            )
        }

        return NextResponse.json(updatedAccommodation)
    } catch (error) {
        console.error('Error updating accommodation status:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}

// DELETE an accommodation
export async function DELETE(req: Request) {
    try {
        const user = await getAuthUser(req)
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')
        if (!id) return NextResponse.json({ message: 'Accommodation ID is required' }, { status: 400 })

        await prisma.accommodation.delete({
            where: { id }
        })

        return NextResponse.json({ message: 'Accommodation deleted successfully' })
    } catch (error) {
        console.error('Error deleting accommodation:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}
