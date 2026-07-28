import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function GET(req: Request) {
    try {
        const user = await getAuthUser(req)
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }

        const notifications = await prisma.notification.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
            take: 50 // Limit to recent 50
        })

        return NextResponse.json(notifications)
    } catch (error) {
        console.error('Error fetching notifications:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}

export async function PATCH(req: Request) {
    try {
        const user = await getAuthUser(req)
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }

        const { id, readAll } = await req.json()

        if (readAll) {
            await prisma.notification.updateMany({
                where: { userId: user.id, read: false },
                data: { read: true }
            })
            return NextResponse.json({ message: 'All notifications marked as read' })
        }

        if (!id) {
            return NextResponse.json({ message: 'Notification ID required' }, { status: 400 })
        }

        // Ensure user owns the notification
        const notification = await prisma.notification.findUnique({ where: { id } })
        if (!notification || notification.userId !== user.id) {
            return NextResponse.json({ message: 'Not found or unauthorized' }, { status: 404 })
        }

        const updated = await prisma.notification.update({
            where: { id },
            data: { read: true }
        })

        return NextResponse.json(updated)
    } catch (error) {
        console.error('Error updating notification:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}

export async function DELETE(req: Request) {
    try {
        const user = await getAuthUser(req)
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')
        const deleteAll = searchParams.get('all') === 'true'

        if (deleteAll) {
            await prisma.notification.deleteMany({
                where: { userId: user.id }
            })
            return NextResponse.json({ message: 'All notifications deleted' })
        }

        if (!id) {
            return NextResponse.json({ message: 'Notification ID required' }, { status: 400 })
        }

        const notification = await prisma.notification.findUnique({ where: { id } })
        if (!notification || notification.userId !== user.id) {
            return NextResponse.json({ message: 'Not found or unauthorized' }, { status: 404 })
        }

        await prisma.notification.delete({
            where: { id }
        })

        return NextResponse.json({ message: 'Notification deleted' })
    } catch (error) {
        console.error('Error deleting notification:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}
