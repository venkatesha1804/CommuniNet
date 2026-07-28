import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Cleaning up database...')

    try {
        // 1. Social & Notifications
        console.log('Deleting social data & notifications...')
        await prisma.like.deleteMany()
        await prisma.comment.deleteMany()
        await prisma.share.deleteMany()
        await prisma.notification.deleteMany()
        await prisma.follow.deleteMany()

        // 2. Applications & Requests
        console.log('Deleting applications & requests...')
        await prisma.accommodationApplication.deleteMany()
        await prisma.mentorshipRequest.deleteMany()
        await prisma.eventAttendee.deleteMany()
        await prisma.supportTicket.deleteMany()
        await prisma.report.deleteMany()

        // 3. Content
        console.log('Deleting platform content...')
        await prisma.business.deleteMany()
        await prisma.event.deleteMany()
        await prisma.job.deleteMany()
        await prisma.scholarship.deleteMany()
        await prisma.mentorship.deleteMany()
        await prisma.achievement.deleteMany()
        await prisma.helpRequest.deleteMany()
        await (prisma as any).accommodation.deleteMany()
        await prisma.businessCollaboration.deleteMany()
        await prisma.donation.deleteMany()

        // 4. Core
        console.log('Deleting users & announcements...')
        await prisma.announcement.deleteMany()
        await prisma.user.deleteMany()

        console.log('Database cleared successfully!')
    } catch (error) {
        console.error('Error clearing database:', error)
    } finally {
        await prisma.$disconnect()
    }
}

main()
