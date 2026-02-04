import type { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

export const ConferenceController = {
    /**
     * Cria uma nova sala de conferência e convida os participantes.
     * Somente supervisores podem iniciar.
     */
    async create(req: Request, res: Response) {
        const { userRole, userId, io } = req;
        const { participants } = req.body; // Array de IDs de usuários

        if (userRole !== 'SUPERVISOR') {
            return res.status(403).json({ error: 'Apenas supervisores podem abrir uma sala de conferência.' });
        }

        if (!participants || !Array.isArray(participants) || participants.length === 0) {
            return res.status(400).json({ error: 'É necessário convidar ao menos um participante.' });
        }

        // Gerar nome único para a sala
        const roomId = `flash-war-room-${uuidv4().slice(0, 8)}`;

        // Buscar nome do supervisor para o convite (opcional, mas bom para UX)
        // Aqui poderíamos buscar do banco, mas podemos simplificar enviando apenas o ID por enquanto
        // ou assumindo que o frontend sabe quem enviou.

        // Enviar convites via Socket para cada participante
        participants.forEach((participantId: string) => {
            io.to(participantId).emit('conference_invite', {
                roomId,
                hostId: userId,
                hostRole: userRole,
                timestamp: new Date()
            });
        });

        return res.json({
            roomId,
            message: 'Sala de conferência criada e convites enviados.'
        });
    }
};
