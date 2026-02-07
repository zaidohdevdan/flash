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
        let { statusPhrase, avatarUrl } = req.body;

        try {
            if (req.file) {
                const uploadedMedia = await mediaService.uploadFromBuffer({
                    buffer: req.file.buffer,
                    userId: userId,
                    options: {
                        folder: 'avatars',
                        resourceType: 'image'
                    }
                });
                avatarUrl = uploadedMedia.secureUrl;
            }

            const user = await authService.updateUser(userId, {
                statusPhrase,
                avatarUrl
            });

            return res.json(user);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Erro ao atualizar perfil" });
        }
    },

    async me(req: Request, res: Response) {
        const userId = req.userId!;
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: {
                    supervisor: {
                        select: { name: true }
                    }
                }
            });

            if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

            return res.json({
                id: user.id,
                name: user.name,
                email: user.email,
                avatarUrl: user.avatarUrl,
                statusPhrase: user.statusPhrase,
                role: user.role,
                departmentId: user.departmentId,
                supervisorId: user.supervisorId,
                supervisorName: user.supervisor?.name
            });
        } catch (error) {
            return res.status(500).json({ error: "Erro ao buscar perfil" });
        }
    }
}
