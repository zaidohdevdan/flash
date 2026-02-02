import { prisma } from '../src/lib/prisma';
import { PrismaReportRepository } from '../src/repositories/implementations/PrismaReportRepository';

async function testDateFilter() {
    console.log('--- Testando Filtro de Data ---');
    const repo = new PrismaReportRepository();

    // 1. Criar um report de teste hoje
    const user = await prisma.user.findFirst({ where: { role: 'PROFESSIONAL' } });
    if (!user) {
        console.error('Nenhum usuário profissional encontrado para o teste.');
        return;
    }

    const report = await repo.create({
        comment: 'Teste de filtro de data',
        imageUrl: 'http://test.com/image.jpg',
        userId: user.id
    });

    console.log('Report criado em:', report.createdAt);

    // 2. Tentar encontrar esse report filtrando de hoje até hoje
    const today = new Date();
    const startDate = new Date(today);
    startDate.setUTCHours(0, 0, 0, 0); // Início do dia

    const endDate = new Date(today);
    endDate.setUTCHours(0, 0, 0, 0); // Início do dia (como estava antes)

    console.log(`Buscando reports de ${startDate.toISOString()} até ${endDate.toISOString()}...`);

    // Como o findAll exige supervisorId, pegamos o supervisor do usuário
    const supervisorId = user.supervisorId!;

    const results = await repo.findAll(supervisorId, 1, 10, undefined, startDate, endDate);

    const found = results.find(r => r.id === report.id);
    if (found) {
        console.log('✅ SUCESSO: Report encontrado no intervalo de data hoje/hoje.');
    } else {
        console.log('❌ FALHA: Report NÃO encontrado no intervalo de data hoje/hoje.');
    }

    // 3. Testar Filtro Global (Ver se Supervisor vê reporte encaminhado ao selecionar "Todos")
    console.log('--- Testando Filtro Global (Supervisor) ---');

    // Criar um reporte e encaminhar
    const forwardedReport = await repo.create({
        comment: 'Reporte para teste global',
        imageUrl: 'http://test.com/global.jpg',
        userId: user.id
    });

    await repo.updateStatus(forwardedReport.id, 'FORWARDED', 'Encaminhando para teste', 'Admin');

    console.log('Reporte encaminhado criado. Buscando com filtro status=undefined (Todos)...');
    const globalResults = await repo.findAll(supervisorId, 1, 10, undefined);

    const foundGlobal = globalResults.find(r => r.id === forwardedReport.id);
    if (foundGlobal) {
        console.log('✅ SUCESSO: Supervisor encontrou reporte FORWARDED usando filtro global.');
    } else {
        console.log('❌ FALHA: Supervisor NÃO encontrou reporte FORWARDED usando filtro global.');
    }

    // Cleanup Final
    await prisma.reportHistory.deleteMany({ where: { reportId: { in: [report.id, forwardedReport.id] } } });
    await prisma.report.deleteMany({ where: { id: { in: [report.id, forwardedReport.id] } } });
    console.log('--- Teste concluído e limpo ---');
}

testDateFilter().catch(console.error).finally(() => prisma.$disconnect());
