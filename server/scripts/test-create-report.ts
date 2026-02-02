
import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function test() {
    console.log('--- Testing Report Creation ---');
    try {
        // Find a trial user (professional)
        const user = await prisma.user.findFirst({
            where: { role: 'PROFESSIONAL' }
        });

        if (!user) {
            console.error('No professional user found to test.');
            return;
        }

        console.log(`Testing with user: ${user.name} (${user.id})`);

        // Attempt to create a report manually as the repository would
        const report = await prisma.report.create({
            data: {
                comment: 'Teste de diagnóstico',
                imageUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
                userId: user.id,
                status: 'SENT',
                history: {
                    create: {
                        status: 'SENT',
                        comment: 'Relatório enviado pelo profissional.',
                        userName: 'Operador'
                    }
                }
            },
            include: {
                user: true,
                history: true
            }
        });

        console.log('Report created successfully:', report.id);

        // Final cleanup of the test report
        await prisma.reportHistory.deleteMany({ where: { reportId: report.id } });
        await prisma.report.delete({ where: { id: report.id } });
        console.log('Test report cleaned up.');

    } catch (error: any) {
        console.error('FAILED to create report:');
        console.error(error);
        if (error.code) console.error('Error Code:', error.code);
        if (error.meta) console.error('Error Meta:', error.meta);
    } finally {
        await prisma.$disconnect();
    }
}

test();
