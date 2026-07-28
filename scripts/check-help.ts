import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function check() {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

    const count = await prisma.helpRequest.count({
        where: {
            type: { in: ['Medical Emergency', 'Blood Requirement', 'Medical & Blood Help'] },
            status: 'pending',
            createdAt: { gte: twentyFourHoursAgo }
        }
    })

    const allPendingMedical = await prisma.helpRequest.count({
        where: {
            type: { in: ['Medical Emergency', 'Blood Requirement', 'Medical & Blood Help'] },
            status: 'pending'
        }
    })

    console.log(`Recent (24h) pending medical requests: ${count}`)
    console.log(`All pending medical requests: ${allPendingMedical}`)

    await prisma.$disconnect()
}

check()
