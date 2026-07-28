const { PrismaClient } = require('./node_modules/@prisma/client');
const prisma = new PrismaClient();
prisma.accommodationApplication.findMany().then(r => console.dir(r, { depth: null })).catch(console.error).finally(() => prisma.$disconnect());
