import { PrismaDepartmentRepository } from "../repositories/implementations/PrismaDepartmentRepository";
import type { IDepartmentRepository } from "../repositories/interfaces/IDepartmentRepository";

export class DepartmentService {
    private departmentRepository: IDepartmentRepository;

    constructor(departmentRepository: IDepartmentRepository = new PrismaDepartmentRepository()) {
        this.departmentRepository = departmentRepository;
    }

    async list() {
        return this.departmentRepository.findAll();
    }

    async create(name: string) {
        const normalized = name.trim();
        const exists = await this.departmentRepository.findByName(normalized);
        if (exists) return exists;

        return this.departmentRepository.create(normalized);
    }

    async delete(id: string) {
        // Usamos uma transação direta com o Prisma aqui para garantir consistência
        // pois envolve multiplos models (Report, User, Department)
        // e a lógica de negócio de "retorno ao supervisor" é específica.
        const { prisma } = await import('../lib/prisma');

        return prisma.$transaction(async (tx) => {
            // 1. Buscar reports deste departamento
            const reports = await tx.report.findMany({
                where: { departmentId: id }
            });

            // 2. Devolver cada report para o supervisor (Status SENT)
            // Criando histórico de sistema
            for (const report of reports) {
                await tx.report.update({
                    where: { id: report.id },
                    data: {
                        departmentId: null,
                        status: 'SENT',
                        history: {
                            create: {
                                status: 'SENT',
                                comment: 'Departamento excluído. Processo retornado automaticamente ao supervisor.',
                                userName: 'Sistema'
                            }
                        }
                    }
                });
            }

            // 3. Desvincular Gerentes (Managers) deste departamento
            await tx.user.updateMany({
                where: { departmentId: id },
                data: { departmentId: null }
            });

            // 4. Excluir o departamento
            await tx.department.delete({
                where: { id }
            });
        });
    }
}
