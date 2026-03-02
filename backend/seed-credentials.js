const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const passwordHash = await bcrypt.hash('password123', 10);

    const admin = await prisma.user.upsert({
        where: { phone: '99999999' },
        update: {},
        create: {
            phone: '99999999',
            name: 'System Admin',
            role: 'SUPER_ADMIN',
            passwordHash,
        },
    });

    const resident = await prisma.user.upsert({
        where: { phone: '88888888' },
        update: {},
        create: {
            phone: '88888888',
            name: 'Test Resident',
            role: 'RESIDENT',
            passwordHash,
        },
    });

    console.log('Seed completed:');
    console.log('Admin:', admin.phone, 'password123');
    console.log('Resident:', resident.phone, 'password123');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
