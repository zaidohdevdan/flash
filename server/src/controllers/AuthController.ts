import type { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
const authService = new AuthService();

export const AuthController = {
    async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;

            const result = await authService.login(email, password);

            return res.json(result);
        } catch (error: any) {
            if (error.message === 'INVALID_CREDENTIALS') {
                return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
            }
            console.error('Erro no Login:', error);
            return res.status(500).json({ error: 'Erro interno no servidor.' });
        }
    }
};