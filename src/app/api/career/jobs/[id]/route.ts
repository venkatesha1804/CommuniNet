import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const job = await prisma.job.findUnique({
            where: { id },
            include: { poster: { select: { name: true, email: true } } }
        })

        if (!job) return NextResponse.json({ message: 'Job not found' }, { status: 404 })

        return NextResponse.json(job)
    } catch (error) {
        console.error('Error fetching job:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const user = await getAuthUser(req)
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

        const job = await prisma.job.findUnique({ where: { id } })
        if (!job) return NextResponse.json({ message: 'Job not found' }, { status: 404 })
        if (job.posterId !== user.id && user.role !== 'admin') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
        }

        const body = await req.json()
        const { title, company, location, type, salary, description, contactEmail, contactPhone, deadline } = body

        const updatedJob = await prisma.job.update({
            where: { id },
            data: {
                title,
                company,
                location,
                type,
                salary: salary || null,
                description,
                contactEmail: contactEmail || null,
                contactPhone: contactPhone || null,
                deadline: deadline ? new Date(deadline) : null,
                status: user.role === 'admin' || job.status === 'approved' ? job.status : 'pending',
            }
        })

        return NextResponse.json(updatedJob)
    } catch (error) {
        console.error('Error updating job:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const user = await getAuthUser(req)
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

        const job = await prisma.job.findUnique({ where: { id } })
        if (!job) return NextResponse.json({ message: 'Job not found' }, { status: 404 })
        if (job.posterId !== user.id && user.role !== 'admin') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
        }

        if (user.role === 'admin') {
            await prisma.job.update({ where: { id }, data: { status: 'deleted_by_admin' } })
            return NextResponse.json({ message: 'Job marked as deleted by admin' })
        }

        await prisma.job.delete({ where: { id } })
        return NextResponse.json({ message: 'Job deleted' })
    } catch (error) {
        console.error('Error deleting job:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}
