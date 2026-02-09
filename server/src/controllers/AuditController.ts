import type { Request, Response } from 'express';
import { AuditService } from '../services/AuditService';

export class AuditController {
    /**
     * Lista os logs de auditoria (Admin).
     */
    static async index(req: Request, res: Response) {
        try {
            const { page, limit, action, userId } = req.query;

            const result = await AuditService.listLogs({
                page: page ? Number(page) : undefined,
                limit: limit ? Number(limit) : undefined,
                action: action as string,
                userId: userId as string,
            });

            res.json(result);
        } catch (error) {
            console.error('[AuditController] Error listing logs:', error);
            res.status(500).json({ error: 'Erro ao listar logs de auditoria.' });
        }
    }
}
