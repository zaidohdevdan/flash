
import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function auditUsers() {
    const users = await prisma.user.findMany();
    console.table(users.map(u => ({
        id: u.id,
        name: u.name,
        role: u.role,
        supervisorId: u.supervisorId
    })));
    await prisma.$disconnect();
}

auditUsers();
