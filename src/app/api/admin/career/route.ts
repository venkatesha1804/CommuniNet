import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

async function verifyAdmin(req: Request) {
    const user = await getAuthUser(req)
    if (!user || user.role !== 'admin') return null
    return user
}

// GET: List career items by type with status filter
export async function GET(req: Request) {
    try {
        const admin = await verifyAdmin(req)
        if (!admin) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

        const { searchParams } = new URL(req.url)
        const type = searchParams.get('type') || 'jobs'
        const status = searchParams.get('status') || 'pending'
        const search = searchParams.get('search') || ''
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')
        const skip = (page - 1) * limit

        let items: any[] = []
        let total = 0

        if (type === 'jobs') {
            const where: any = { status }
            if (search) { where.OR = [{ title: { contains: search, mode: 'insensitive' } }, { company: { contains: search, mode: 'insensitive' } }] }
            const [count, data] = await Promise.all([
                prisma.job.count({ where }),
                prisma.job.findMany({ where, include: { poster: { select: { name: true, email: true } } }, orderBy: { createdAt: 'desc' }, skip, take: limit })
            ])
            total = count; items = data
        } else if (type === 'scholarships') {
            const where: any = { status }
            if (search) { where.OR = [{ title: { contains: search, mode: 'insensitive' } }] }
            const [count, data] = await Promise.all([
                prisma.scholarship.count({ where }),
                prisma.scholarship.findMany({ where, include: { poster: { select: { name: true, email: true } } }, orderBy: { createdAt: 'desc' }, skip, take: limit })
            ])
            total = count; items = data
        } else if (type === 'mentorship') {
            const where: any = { status }
            if (search) { where.OR = [{ expertise: { contains: search, mode: 'insensitive' } }, { mentor: { name: { contains: search, mode: 'insensitive' } } }] }
            const [count, data] = await Promise.all([
                prisma.mentorship.count({ where }),
                prisma.mentorship.findMany({ where, include: { mentor: { select: { name: true, email: true, location: true } } }, orderBy: { createdAt: 'desc' }, skip, take: limit })
            ])
            total = count; items = data
        }

        return NextResponse.json({ data: items, pagination: { total, pages: Math.ceil(total / limit), currentPage: page, limit } })
    } catch (error) {
        console.error('Error fetching admin career items:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}

// PATCH: Approve or reject a career item
export async function PATCH(req: Request) {
    try {
        const admin = await verifyAdmin(req)
        if (!admin) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

        const body = await req.json()
        const { id, type, status } = body

        if (!id || !type || !['approved', 'rejected'].includes(status)) {
            return NextResponse.json({ message: 'Invalid request' }, { status: 400 })
        }

        let updated: any
        if (type === 'jobs') {
            updated = await prisma.job.update({ where: { id }, data: { status } })
            if (status === 'approved') {
                const { broadcastNotification } = await import('@/lib/notifications')
                await broadcastNotification(
                    "New Job Opportunity",
                    `A new job "${updated.title}" at ${updated.company} has been posted.`,
                    "job",
                    "/career?tab=jobs"
                )
            }
        }
        else if (type === 'scholarships') updated = await prisma.scholarship.update({ where: { id }, data: { status } })
        else if (type === 'mentorship') updated = await prisma.mentorship.update({ where: { id }, data: { status } })
        else return NextResponse.json({ message: 'Invalid type' }, { status: 400 })

        return NextResponse.json(updated)
    } catch (error) {
        console.error('Error updating career item status:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}

// DELETE: Soft delete a career item
export async function DELETE(req: Request) {
    try {
        const admin = await verifyAdmin(req)
        if (!admin) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')
        const type = searchParams.get('type')

        if (!id || !type) return NextResponse.json({ message: 'ID and Type are required' }, { status: 400 })

        if (type === 'jobs') await prisma.job.update({ where: { id }, data: { status: 'deleted_by_admin' } })
        else if (type === 'scholarships') await prisma.scholarship.update({ where: { id }, data: { status: 'deleted_by_admin' } })
        else if (type === 'mentorship') await prisma.mentorship.update({ where: { id }, data: { status: 'deleted_by_admin' } })
        else return NextResponse.json({ message: 'Invalid type' }, { status: 400 })

        return NextResponse.json({ message: 'Item deleted successfully' })
    } catch (error) {
        console.error('Error deleting career item:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}
