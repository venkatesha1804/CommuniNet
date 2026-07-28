import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function update() {
    const updated = await prisma.helpRequest.updateMany({
        where: {
            type: { in: ['Medical Emergency', 'Blood Requirement', 'Medical & Blood Help'] },
            status: 'pending'
        },
        data: {
            status: 'approved'
        }
    })
    console.log(`Updated ${updated.count} medical requests to approved.`)
    await prisma.$disconnect()
}

update()
