import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

async function verifyAdmin(req: Request) {
    const user = await getAuthUser(req)
    if (!user || user.role !== 'admin') return null
    return user
}

// GET: List pending help and achievements
export async function GET(req: Request) {
    try {
        const admin = await verifyAdmin(req)
        if (!admin) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

        const { searchParams } = new URL(req.url)
        const type = searchParams.get('type') || 'achievements'
        const status = searchParams.get('status') || 'pending'
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')
        const skip = (page - 1) * limit

        let items: any[] = []
        let total = 0

        if (type === 'achievements') {
            const [count, data] = await Promise.all([
                prisma.achievement.count({ where: { status } }),
                prisma.achievement.findMany({
                    where: { status },
                    include: { user: { select: { name: true, email: true } } },
                    orderBy: { createdAt: 'desc' },
                    skip,
                    take: limit
                })
            ])
            total = count
            items = data
        } else if (type === 'help') {
            const [count, data] = await Promise.all([
                prisma.helpRequest.count({ where: { status } }),
                prisma.helpRequest.findMany({
                    where: { status },
                    include: { user: { select: { name: true, email: true } } },
                    orderBy: { createdAt: 'desc' },
                    skip,
                    take: limit
                })
            ])
            total = count
            items = data
        }

        return NextResponse.json({
            data: items,
            pagination: { total, pages: Math.ceil(total / limit), currentPage: page, limit }
        })
    } catch (error) {
        console.error('Error fetching admin content:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}

// PATCH: Approve or reject
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

        if (type === 'achievements') {
            updated = await prisma.achievement.update({ where: { id }, data: { status } })
        } else if (type === 'help') {
            updated = await prisma.helpRequest.update({ where: { id }, data: { status } })

            // Broadcast emergency alerts when approved
            if (status === 'approved' && ['Medical Emergency', 'Blood Requirement', 'Medical & Blood Help'].includes(updated.type)) {
                const { broadcastNotification } = await import('@/lib/notifications')
                await broadcastNotification(
                    "EMERGENCY ALERT",
                    `URGENT: ${updated.title}. Please check the Help Center for details.`,
                    "emergency",
                    "/help"
                )
            }
        }

        return NextResponse.json(updated)
    } catch (error) {
        console.error('Error updating content status:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}

// DELETE: Soft delete content
export async function DELETE(req: Request) {
    try {
        const admin = await verifyAdmin(req)
        if (!admin) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')
        const type = searchParams.get('type')

        if (!id || !type) {
            return NextResponse.json({ message: 'ID and Type are required' }, { status: 400 })
        }

        if (type === 'achievements') {
            await prisma.achievement.update({ where: { id }, data: { status: 'deleted_by_admin' } })
        } else if (type === 'help') {
            await prisma.helpRequest.update({ where: { id }, data: { status: 'deleted_by_admin' } })
        } else {
            return NextResponse.json({ message: 'Invalid type' }, { status: 400 })
        }

        return NextResponse.json({ message: 'Content deleted successfully' })

    } catch (error) {
        console.error('Error deleting content:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}
