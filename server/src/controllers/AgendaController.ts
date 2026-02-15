import type { Request, Response } from 'express';
import { AgendaService } from '../services/AgendaService';
import { NoteService } from '../services/NoteService';
import { prisma } from '../lib/prisma';
import { AuditService } from '../services/AuditService';

const agendaService = new AgendaService();
const noteService = new NoteService();

export const AgendaController = {
    // Listar eventos do usuário logado
    index: async (req: Request, res: Response) => {
        const userId = req.userId!;
        const { startDate, endDate } = req.query;

        try {
            const events = await agendaService.listUserEvents(
                userId,
                startDate ? new Date(startDate as string) : undefined,
                endDate ? new Date(endDate as string) : undefined
            );
            return res.json(events);
        } catch (error) {
            console.error('[AgendaController] Erro ao listar eventos:', error);
            return res.status(500).json({ error: 'Erro ao listar eventos' });
        }
    },

    // Criar novo evento
    create: async (req: Request, res: Response) => {
        const userId = req.userId!;
        const { title, description, type, startTime, endTime, participantIds, reportId } = req.body;

        try {
            const event = await agendaService.createEvent({
                title,
                description,
                type,
                startTime: new Date(startTime),
                endTime: endTime ? new Date(endTime) : undefined,
                createdById: userId,
                participantIds: participantIds || [],
                reportId
            }, req.io);

            // Auditoria
            await AuditService.log({
                userId,
                action: 'CREATE_AGENDA_EVENT',
                target: `Event:${event.id}`,
                details: { title, type },
                ip: req.ip,
                userAgent: req.get('user-agent')
            });

            return res.status(201).json(event);
        } catch (error: any) {
            console.error('[AgendaController] Erro ao criar evento:', error);
            if (error.message === 'PAST_DATE') {
                return res.status(400).json({ error: 'Não é possível agendar eventos no passado' });
            }
            return res.status(500).json({ error: 'Erro ao criar evento' });
        }
    },

    // Deletar evento
    delete: async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            await agendaService.deleteEvent(String(id));

            // Auditoria
            await AuditService.log({
                userId: req.userId,
                action: 'DELETE_AGENDA_EVENT',
                target: `Event:${id}`,
                ip: req.ip,
                userAgent: req.get('user-agent')
            });

            return res.status(204).send();
        } catch (error) {
            console.error('[AgendaController] Erro ao deletar evento:', error);
            return res.status(500).json({ error: 'Erro ao deletar evento' });
        }
    },

    // Salvar nota (Scratchpad)
    saveNote: async (req: Request, res: Response) => {
        const userId = req.userId!;
        const { content } = req.body;

        try {
            const note = await noteService.saveNote(userId, content);
            return res.json(note);
        } catch (error) {
            console.error('[AgendaController] Erro ao salvar nota:', error);
            return res.status(500).json({ error: 'Erro ao salvar nota' });
        }
    },

    // Buscar nota
    getNote: async (req: Request, res: Response) => {
        const userId = req.userId!;
        try {
            const note = await noteService.getNote(userId);
            return res.json(note || { content: '' });
        } catch (error) {
            console.error('[AgendaController] Erro ao buscar nota:', error);
            return res.status(500).json({ error: 'Erro ao buscar nota' });
        }
    },

    // Listar contatos para marcação (Supervisores + Gerentes + Profissionais subordinados)
    listContacts: async (req: Request, res: Response) => {
        const userId = req.userId!;
        try {
            // Simplificando: retorna todos os usuários exceto o próprio para o MVP
            // Em produção, isso seria filtrado por setor/rede de apoio
            const contacts = await prisma.user.findMany({
                where: { id: { not: userId } },
                select: { id: true, name: true, avatarUrl: true, role: true, department: { select: { name: true } } },
                orderBy: { name: 'asc' }
            });
            return res.json(contacts);
        } catch (error) {
            console.error('[AgendaController] Erro ao listar contatos:', error);
            return res.status(500).json({ error: 'Erro ao listar contatos' });
        }
    }
};
