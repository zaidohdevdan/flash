import type { Namespace } from "socket.io";
import { PrismaClient } from "../src/generated/prisma";
import bcrypt from 'bcrypt';
import { Role } from "../src/generated/prisma";

const prisma = new PrismaClient();

async function main() {
    const hash = await bcrypt.hash('123456', 10);

    // Create Admin user
    const admin = await prisma.user.upsert({
        where: { email: 'admin@flash.com' },
        update: {
            passwordHash: hash,
            role: Role.ADMIN
        },
        create: {
            name: 'Administrador Flash',
            email: 'admin@flash.com',
            passwordHash: hash,
            role: Role.ADMIN
        }
    });

    console.log('Admin user created:', admin.email);

    // Create supervisor user
    const supervisor = await prisma.user.upsert({
        where: { email: 'super@sis.com' },
        update: {
            passwordHash: hash,
            role: Role.SUPERVISOR
        },
        create: {
            name: 'Supervisor Geral',
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