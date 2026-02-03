import { prisma } from '../lib/prisma';

export interface AuditLogData {
    userId?: string;
    action: string;
    target?: string;
    details?: any;
    ip?: string;
    userAgent?: string;
}

export class AuditService {
    /**
     * Registra uma nova entrada no log de auditoria.
     */
    static async log(data: AuditLogData) {
        try {
            await prisma.auditLog.create({
                data: {
                    userId: data.userId,
                    action: data.action,
                    target: data.target,
                    details: data.details ? JSON.stringify(data.details) : null,
                    ip: data.ip,
                    userAgent: data.userAgent
                }
            });
        } catch (error) {
            console.error('AuditLog Error:', error);
            // Não travamos a execução principal se o log falhar, 
            // mas registramos no console para rastreio.
        }
    }
}
