
import { PrismaClient } from '../src/generated/prisma';
import { PrismaReportRepository } from '../src/repositories/implementations/PrismaReportRepository';

const prisma = new PrismaClient();
const repo = new PrismaReportRepository();

async function testAnalytics() {
    console.log('--- Testando Analytics (Advanced Stats) ---');

    // 1. Identificar um Supervisor ou Gerente
    const supervisor = await prisma.user.findFirst({
        where: { role: 'SUPERVISOR' }
    });

    if (!supervisor) {
        console.log('❌ Nenhum supervisor encontrado para teste.');
        return;
    }

    console.log(`Testando com Supervisor: ${supervisor.name} (${supervisor.id})`);

    // 2. Chamar o método getAdvancedStats
    try {
        const stats = await repo.getAdvancedStats(supervisor.id, 'SUPERVISOR');
        console.log('Stats recebidos:', JSON.stringify(stats, null, 2));

        // 3. Validações Básicas
        if (!stats.efficiency || !stats.bottlenecks || !stats.volume || !stats.sectorPerformance) {
            throw new Error('❌ Estrutura de resposta inválida.');
        }

        console.log('✅ Estrutura de dados válida.');

        if (Array.isArray(stats.volume)) {
            console.log(`✅ Volume contém ${stats.volume.length} dias de dados.`);
        }

        if (Array.isArray(stats.sectorPerformance)) {
            console.log(`✅ Performance por setor contém ${stats.sectorPerformance.length} setores.`);
        }

    } catch (error) {
        console.error('❌ Erro ao buscar stats:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testAnalytics();
