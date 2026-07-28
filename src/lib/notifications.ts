import { prisma } from '@/lib/prisma'

export type NotificationType = 'emergency' | 'job' | 'event' | 'social' | 'system' | 'accommodation'

/**
 * Creates a notification for a single user.
 */
export async function createNotification(
    userId: string,
    title: string,
    message: string,
    type: NotificationType,
    link?: string
) {
    try {
        const notification = await prisma.notification.create({
            data: {
                userId,
                title,
                message,
                type,
                link
            }
        })
        return notification
    } catch (error) {
        console.error('Failed to create notification', error)
        return null
    }
}

/**
 * Broadcasts a notification to all active members of the community.
 * Useful for Emergency Alerts, major events, or new job broadcasts.
 */
export async function broadcastNotification(
    title: string,
    message: string,
    type: NotificationType,
    link?: string
) {
    try {
        // Fetch all verified members
        const users = await prisma.user.findMany({
            where: {
                status: 'approved',
                role: { in: ['member', 'admin'] }
            },
            select: { id: true }
        })

        if (!users.length) return 0

        // Bulk insert notifications
        const result = await prisma.notification.createMany({
            data: users.map(user => ({
                userId: user.id,
                title,
                message,
                type,
                link,
                read: false
            }))
        })

        return result.count
    } catch (error) {
        console.error('Failed to broadcast notification', error)
        return 0
    }
}
