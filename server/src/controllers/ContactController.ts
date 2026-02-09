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
            const messages = await prisma.contactMessage.findMany({
                orderBy: { createdAt: 'desc' }
            });
            return res.status(200).json(messages);
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
}
