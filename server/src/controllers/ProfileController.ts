import type { Request, Response } from "express";
import { AuthService } from "../services/AuthService";

const authService = new AuthService();
/* Instantiating MediaService locally for ProfileController usage */
import { prisma } from "../lib/prisma";
import { PrismaMediaRepository } from "../repositories/implementations/PrismaMediaRepository";
import { MediaService } from "../services/MediaService";

const mediaRepository = new PrismaMediaRepository(prisma);
const mediaService = new MediaService(mediaRepository);

export const ProfileController = {
    async update(req: Request, res: Response) {
        const userId = req.userId!;
        const { statusPhrase } = req.body;

        let avatarUrl = undefined;

        if (req.file) {
            try {
                // Upload avatar to Cloudinary
                const uploadResult = await mediaService.uploadFromBuffer({
                    buffer: req.file.buffer,
                    userId,
                    options: {
                        folder: 'avatars',
                        width: 500,
                        height: 500,
                        crop: 'fill',
                        gravity: 'face'
                    }
                });
                avatarUrl = uploadResult.secureUrl;
            } catch (error) {
                console.error("Error uploading avatar:", error);
                return res.status(500).json({ error: "Erro ao fazer upload do avatar" });
            }
        }

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
