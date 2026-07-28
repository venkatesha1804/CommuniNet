import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const password = await bcrypt.hash('password123', 10)

    console.log('Seeding Admin User...')
    const admin = await prisma.user.upsert({
        where: { email: 'admin@communet.com' },
        update: {},
        create: {
            email: 'admin@communet.com',
            name: 'Main Admin',
            password,
            mobile: '9999999999',
            role: 'admin',
            status: 'approved'
        },
    })

    console.log('Admin user created:', admin.email)
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
