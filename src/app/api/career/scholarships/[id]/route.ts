import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const scholarship = await prisma.scholarship.findUnique({
            where: { id },
            include: { poster: { select: { name: true, email: true } } }
        })

        if (!scholarship) return NextResponse.json({ message: 'Scholarship not found' }, { status: 404 })

        return NextResponse.json(scholarship)
    } catch (error) {
        console.error('Error fetching scholarship:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const user = await getAuthUser(req)
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

        const scholarship = await prisma.scholarship.findUnique({ where: { id } })
        if (!scholarship) return NextResponse.json({ message: 'Scholarship not found' }, { status: 404 })
        if (scholarship.posterId !== user.id && user.role !== 'admin') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
        }

        const body = await req.json()
        const { title, amount, type, eligibility, description, deadline, link } = body

        const updated = await prisma.scholarship.update({
            where: { id },
            data: {
                title,
                amount,
                type: type || scholarship.type,
                eligibility,
                description,
                deadline: new Date(deadline),
                link: link || null,
                status: user.role === 'admin' || scholarship.status === 'approved' ? scholarship.status : 'pending',
            }
        })

        return NextResponse.json(updated)
    } catch (error) {
        console.error('Error updating scholarship:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const user = await getAuthUser(req)
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

        const scholarship = await prisma.scholarship.findUnique({ where: { id } })
        if (!scholarship) return NextResponse.json({ message: 'Scholarship not found' }, { status: 404 })
        if (scholarship.posterId !== user.id && user.role !== 'admin') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
        }

        if (user.role === 'admin') {
            await prisma.scholarship.update({ where: { id }, data: { status: 'deleted_by_admin' } })
            return NextResponse.json({ message: 'Scholarship marked as deleted by admin' })
        }

        await prisma.scholarship.delete({ where: { id } })
        return NextResponse.json({ message: 'Scholarship deleted' })
    } catch (error) {
        console.error('Error deleting scholarship:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}
