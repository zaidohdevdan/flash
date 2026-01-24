import type { Request, Response } from "express";
import { AuthService } from "../services/AuthService";

const authService = new AuthService();

export const ProfileController = {
    async update(req: Request, res: Response) {
        const userId = req.userId!;
        const { statusPhrase } = req.body;
        const avatarUrl = req.file?.filename;

        try {
            const user = await authService.updateProfile(userId, {
                statusPhrase,
                avatarUrl
            });

            return res.json({
                id: user.id,
                name: user.name,
                email: user.email,
                avatarUrl: user.avatarUrl,
                statusPhrase: user.statusPhrase,
                role: user.role
            });
        } catch (error) {
            return res.status(500).json({ error: "Erro ao atualizar perfil" });
        }
    },

    async me(req: Request, res: Response) {
        const userId = req.userId!;
        try {
            // Reutilizando lógica de AuthService ou UserRepository se necessário
            const user = await authService.updateProfile(userId, {});

            return res.json({
                id: user.id,
                name: user.name,
                email: user.email,
                avatarUrl: user.avatarUrl,
                statusPhrase: user.statusPhrase,
                role: user.role
            });
        } catch (error) {
            return res.status(500).json({ error: "Erro ao buscar perfil" });
        }
    }
}
