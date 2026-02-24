import type { Request, Response } from 'express';
import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

export const AdminController = {
    async getStats(req: Request, res: Response) {
        try {
            const [
                totalUsers,
                totalReports,
                totalTickets,
                resolvedTickets,
                totalDepartments
            ] = await Promise.all([
                prisma.user.count(),
                prisma.report.count(),
                prisma.ticket.count(),
                prisma.ticket.count({
                    where: {
                        status: {
                            in: ['RESOLVED', 'CLOSED']
                        }
                    }
                }),
                prisma.department.count()
            ]);

            // Mocking the growth until we build analytic queries
            const stats = {
                totalUsers,
                totalReports,
                totalTickets,
                resolvedTickets,
                totalDepartments,
                monthlyGrowth: {
                    users: 0,
                    reports: 0
                },
                recentActivity: []
            };

            return res.json(stats);
        } catch (error) {
            console.error('Erro ao buscar estatísticas do admin:', error);
            return res.status(500).json({ error: 'Erro ao buscar estatísticas' });
        }
    }
};
