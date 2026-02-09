import { prisma } from '../lib/prisma';
import { Server as SocketIOServer } from 'socket.io';

let ioInstance: SocketIOServer | null = null;

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
     * Configura a instância do Socket.IO para transmissões.
     */
    static setIO(io: SocketIOServer) {
        ioInstance = io;
    }

    /**
     * Registra uma nova entrada no log de auditoria.
     */
    static async log(data: AuditLogData) {
        try {
            const log = await prisma.auditLog.create({
                data: {
                    userId: data.userId,
                    action: data.action,
                    target: data.target,
                    details: data.details ? JSON.stringify(data.details) : null,
                    ip: data.ip,
                    userAgent: data.userAgent
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            avatarUrl: true
                        }
                    }
                }
            });

            // Transmitir para admins em tempo real
            if (ioInstance) {
                // Emitir apenas para a sala de admins
                ioInstance.to('admin-monitor').emit('new_audit_log', log);
            }

            return log;
        } catch (error) {
            console.error('AuditLog Error:', error);
        }
    }

    /**
     * Lista logs com paginação e filtros.
     */
    static async listLogs(params: {
        page?: number;
        limit?: number;
        action?: string;
        userId?: string;
    }) {
        const { page = 1, limit = 50, action, userId } = params;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (action) where.action = action;
        if (userId) where.userId = userId;

        const [logs, total] = await Promise.all([
            prisma.auditLog.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            avatarUrl: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.auditLog.count({ where }),
        ]);

        return {
            logs,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
            }
        };
    }
}
