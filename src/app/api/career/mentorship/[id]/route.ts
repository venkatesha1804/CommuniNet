import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const mentorship = await prisma.mentorship.findUnique({
            where: { id },
            include: { mentor: { select: { id: true, name: true, email: true, location: true, bio: true, profileImage: true } } }
        })

        if (!mentorship) {
            return NextResponse.json({ message: 'Mentor not found' }, { status: 404 })
        }

        return NextResponse.json(mentorship)
    } catch (error) {
        console.error('Error fetching mentor:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const user = await getAuthUser(req)
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

        const mentorship = await prisma.mentorship.findUnique({ where: { id } })
        if (!mentorship) return NextResponse.json({ message: 'Mentor not found' }, { status: 404 })
        if (mentorship.mentorId !== user.id && user.role !== 'admin') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
        }

        const body = await req.json()
        const { expertise, bio, available } = body

        const updated = await prisma.mentorship.update({
            where: { id },
            data: {
                expertise,
                bio,
                available: available !== undefined ? available : mentorship.available,
                status: user.role === 'admin' || mentorship.status === 'approved' ? mentorship.status : 'pending',
            }
        })

        return NextResponse.json(updated)
    } catch (error) {
        console.error('Error updating mentorship:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const user = await getAuthUser(req)
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

        const mentorship = await prisma.mentorship.findUnique({ where: { id } })
        if (!mentorship) return NextResponse.json({ message: 'Mentor not found' }, { status: 404 })
        if (mentorship.mentorId !== user.id && user.role !== 'admin') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
        }

        await prisma.mentorship.delete({ where: { id } })
        return NextResponse.json({ message: 'Mentorship profile deleted' })
    } catch (error) {
        console.error('Error deleting mentorship:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}
