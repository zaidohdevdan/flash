import type { Namespace } from "socket.io";
import { PrismaClient } from "../src/generated/prisma";
import bcrypt from 'bcryptjs';
import { Role } from "../src/generated/prisma";

const prisma = new PrismaClient();

async function main() {
    const hash = await bcrypt.hash('123456', 10);

    // Create supervisor user
    const supervisor = await prisma.user.upsert({
        where: { email: 'super@sis.com' },
        update: {},
        create: {
            name: 'Supervisor',
            email: 'super@sis.com',
            passwordHash: hash,
            role: Role.SUPERVISOR
        }
    });

    console.log('Supervisor user created:', supervisor);

    // Create professional user linked to supervisor
    await prisma.user.upsert({
        where: {
            email: 'profissional@sistema.com',
        },
        update: {},
        create: {
            name: 'Profissional',
            email: 'profissional@sistema.com',
            passwordHash: hash,
            role: Role.PROFESSIONAL,
            supervisorId: supervisor.id
        }
    });

    // Create patient user linked to professional


    //

}
main().finally(() => prisma.$disconnect());