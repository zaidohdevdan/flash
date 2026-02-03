import type { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { AuditService } from '../services/AuditService';
const authService = new AuthService();

export const AuthController = {
    async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;

            const result = await authService.login(email, password);

            // Auditoria
            await AuditService.log({
                userId: result.user.id,
                action: 'LOGIN',
                ip: req.ip,
                userAgent: req.get('user-agent')
            });

            return res.json(result);
        } catch (error: any) {
            if (error.message === 'INVALID_CREDENTIALS') {
                return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
            }
            console.error('Erro no Login:', error);
            return res.status(500).json({ error: 'Erro interno no servidor.' });
        }
    },

    async register(req: Request, res: Response) {
        try {
            const { name, email, password, role, supervisorId, departmentId } = req.body;
            const result = await authService.register({ name, email, password, role, supervisorId, departmentId } as any);

            // Auditoria
            await AuditService.log({
                userId: req.userId,
                action: 'CREATE_USER',
                target: `User:${result.id}`,
                details: { name, email, role },
                ip: req.ip,
                userAgent: req.get('user-agent')
            });

            return res.status(201).json(result);
        } catch (error: any) {
            if (error.message === 'USER_ALREADY_EXISTS') {
                return res.status(400).json({ error: 'Este e-mail já está cadastrado.' });
            }
            if (error.message === 'UNAUTHORIZED_ROLE_CREATION') {
                return res.status(403).json({ error: 'Apenas a infraestrutura pode criar administradores.' });
            }
            return res.status(500).json({ error: 'Erro ao realizar cadastro.' });
        }
    },

    async listSupervisors(req: Request, res: Response) {
        try {
            const supervisors = await authService.listSupervisors();
            return res.json(supervisors);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao listar supervisores.' });
        }
    },

    async listAllUsers(req: Request, res: Response) {
        try {
            const search = req.query.search ? String(req.query.search) : undefined;
            const role = req.query.role as any;
            const users = await authService.listAllUsers({ search: search as string, role });
            return res.json(users);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao listar usuários.' });
        }
    },

    async update(req: Request, res: Response) {
        try {
            const { id } = req.params as { id: string };

            // Seguridade: Admin não pode alterar a si mesmo via gestão
            if (id === req.userId) {
                return res.status(403).json({ error: 'Você não pode alterar seu próprio cadastro administrativo via painel de gestão.' });
            }

            const data = req.body;
            const result = await authService.updateUser(id, data);

            // Auditoria
            await AuditService.log({
                userId: req.userId,
                action: 'UPDATE_USER',
                target: `User:${id}`,
                details: data,
                ip: req.ip,
                userAgent: req.get('user-agent')
            });

            return res.json(result);
        } catch (error) {
            console.error('Erro ao editar usuário:', error);
            return res.status(500).json({ error: 'Erro ao editar usuário.' });
        }
    },

    async listSubordinates(req: Request, res: Response) {
        try {
            const supervisorId = req.userId!;
            const subordinates = await authService.listSubordinates(supervisorId);
            return res.json(subordinates);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao listar subordinados.' });
        }
    },

    async listSupportNetwork(req: Request, res: Response) {
        try {
            const supportNetwork = await authService.listSupportNetwork();
            return res.json(supportNetwork);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao listar rede de apoio.' });
        }
    },

    async delete(req: Request, res: Response) {
        try {
            const { id } = req.params as { id: string };

            // Seguridade: Admin não pode deletar a si mesmo
            if (id === req.userId) {
                return res.status(403).json({ error: 'Você não pode remover seu próprio acesso administrativo.' });
            }

            await authService.deleteUser(id);

            // Auditoria
            await AuditService.log({
                userId: req.userId,
                action: 'DELETE_USER',
                target: `User:${id}`,
                ip: req.ip,
                userAgent: req.get('user-agent')
            });

            return res.status(204).send();
        } catch (error: any) {
            console.error('Erro ao deletar usuário:', error);
            return res.status(500).json({ error: 'Erro ao deletar usuário. Verifique se ele possui vínculos pendentes.' });
        }
    }
};