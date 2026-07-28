import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seed() {
    // Get a user ID to associate with the requests
    const user = await prisma.user.findFirst()
    if (!user) {
        console.error("No user found to associate requests with.")
        return
    }

    const requests = [
        {
            userId: user.id,
            type: 'Medical Emergency',
            title: 'Urgent Heart Surgery Fund',
            description: 'Financial assistance needed for immediate cardiac bypass surgery at Apollo Hospital. Every contribution counts.',
            contact: '9876543210',
            status: 'pending'
        },
        {
            userId: user.id,
            type: 'Blood Requirement',
            title: 'B+ Blood Needed (3 Units)',
            description: 'Urgent requirement for B+ blood at Care Hospital for an emergency procedure. Please contact as soon as possible.',
            contact: '8765432109',
            status: 'pending'
        },
        {
            userId: user.id,
            type: 'Medical & Blood Help',
            title: 'Cancer Treatment Support',
            description: 'Support needed for ongoing chemotherapy and medication for a community elderly member.',
            contact: '7654321098',
            status: 'pending'
        }
    ]

    for (const req of requests) {
        await prisma.helpRequest.create({
            data: req
        })
    }

    console.log(`Seeded ${requests.length} medical requests.`)
    await prisma.$disconnect()
}

seed()
