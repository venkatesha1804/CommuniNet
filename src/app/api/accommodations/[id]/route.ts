import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const user = await getAuthUser(req)
        const isAuthenticated = !!user

        const accommodation = await (prisma as any).accommodation.findUnique({
            where: { id },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        profileImage: true,
                        role: true,
                    }
                }
            }
        })

        if (!accommodation) {
            return NextResponse.json({ message: 'Accommodation not found' }, { status: 404 })
        }

        // Only hide contact details if the accommodation is public. 
        // If it's the owner themself, or an admin, or an authenticated user, they can see it.
        if (
            !isAuthenticated &&
            accommodation.status === 'approved'
        ) {
            return NextResponse.json({
                ...accommodation,
                contactPhone: 'Log in to view',
                contactEmail: 'Log in to view',
                isGuestView: true,
            })
        }

        return NextResponse.json({
            ...accommodation,
            isGuestView: false,
        })

    } catch (error) {
        console.error('Error fetching accommodation:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const user = await getAuthUser(req)
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

        const body = await req.json()
        const { name, type, gender, location, city, amenities, pricing, description, images, contactPhone, contactEmail } = body

        const accommodation = await (prisma as any).accommodation.findUnique({
            where: { id }
        })

        if (!accommodation) {
            return NextResponse.json({ message: 'Not found' }, { status: 404 })
        }

        if (accommodation.ownerId !== user.id && user.role !== 'admin') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
        }

        // If changed by member, status could reset to pending depending on policy.
        // Let's keep it simple and preserve the existing status or update to pending if we want strict re-review
        // We'll reset it to pending unless an admin is making the change
        const status = user.role === 'admin' ? accommodation.status : 'pending'

        const updated = await (prisma as any).accommodation.update({
            where: { id },
            data: {
                name,
                type,
                gender,
                location,
                city,
                amenities,
                pricing,
                description,
                images,
                contactPhone,
                contactEmail,
                status
            }
        })

        return NextResponse.json(updated)
    } catch (error) {
        console.error('Error updating accommodation:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const user = await getAuthUser(req)
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

        const accommodation = await (prisma as any).accommodation.findUnique({
            where: { id }
        })

        if (!accommodation) {
            return NextResponse.json({ message: 'Not found' }, { status: 404 })
        }

        if (accommodation.ownerId !== user.id && user.role !== 'admin') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
        }

        await (prisma as any).accommodation.delete({
            where: { id }
        })

        return NextResponse.json({ message: 'Deleted successfully' })
    } catch (error) {
        console.error('Error deleting accommodation:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}
