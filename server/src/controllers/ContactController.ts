import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export class ContactController {
    static async store(req: Request, res: Response) {
        try {
            const { name, email, company, message } = req.body;

            if (!name || !email || !message) {
                return res.status(400).json({ error: 'Campos obrigatórios ausentes' });
            }

            const newMessage = await prisma.contactMessage.create({
                data: {
                    name,
                    email,
                    company,
                    message
                }
            });

            // Note: In a production environment with an SMTP service configured,
            // we would trigger an email sending event here using NodeMailer or similar.
            // For now, we save to the database as requested.

            return res.status(201).json(newMessage);
        } catch (error) {
            console.error('Erro ao salvar mensagem de contato:', error);
            return res.status(500).json({ error: 'Erro interno ao processar a mensagem' });
        }
    }

    static async index(req: Request, res: Response) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const search = req.query.search as string;
            const readStatus = req.query.readStatus as string;

            const skip = (page - 1) * limit;

            const where: any = {};

            if (search) {
                where.OR = [
                    { name: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                    { company: { contains: search, mode: 'insensitive' } }
                ];
            }

            if (readStatus === 'true') {
                where.read = true;
            } else if (readStatus === 'false') {
                where.read = false;
            }

            const [messages, total] = await Promise.all([
                prisma.contactMessage.findMany({
                    where,
                    orderBy: { createdAt: 'desc' },
                    skip,
                    take: limit
                }),
                prisma.contactMessage.count({ where })
            ]);

            return res.status(200).json({
                data: messages,
                total,
                page,
                totalPages: Math.ceil(total / limit)
            });
        } catch (error) {
            console.error('Erro ao buscar mensagens:', error);
            return res.status(500).json({ error: 'Erro ao buscar mensagens' });
        }
    }

    static async markAsRead(req: Request, res: Response) {
        try {
            const { id } = req.params;

            if (typeof id !== 'string') {
                return res.status(400).json({ error: 'ID inválido' });
            }

            await prisma.contactMessage.update({
                where: { id },
                data: { read: true }
            });
            return res.status(204).send();
        } catch (error) {
            console.error('Erro ao marcar como lida:', error);
            return res.status(500).json({ error: 'Erro ao processar solicitação' });
        }
    }

    static async destroy(req: Request, res: Response) {
        try {
            const { id } = req.params;

            if (typeof id !== 'string') {
                return res.status(400).json({ error: 'ID inválido' });
            }

            await prisma.contactMessage.delete({
                where: { id }
            });
            return res.status(204).send();
        } catch (error) {
            console.error('Erro ao excluir mensagem de contato:', error);
            return res.status(500).json({ error: 'Erro ao excluir mensagem' });
        }
    }
}
