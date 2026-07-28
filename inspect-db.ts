import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const apps = await prisma.accommodationApplication.findMany();
    console.log(JSON.stringify(apps, null, 2));
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    });
