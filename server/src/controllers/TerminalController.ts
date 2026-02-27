import type { Request, Response } from 'express';
import { TerminalService } from '../services/TerminalService';

export class TerminalController {
    static async execute(req: Request, res: Response) {
        try {
            const { command } = req.body as { command: string };
            const userEmail = (req as any).userName || 'System'; // from auth hook

            // Check admin rights
            if ((req as any).userRole !== 'ADMIN') {
                return res.status(403).json([{ type: 'error', message: 'Permissão negada. O terminal é restrito à administradores.' }]);
            }

            if (!command) {
                return res.json([]);
            }

            const output = await TerminalService.executeCommand(command, userEmail);

            return res.json(output);
        } catch (error) {
            console.error('Terminal Execution Error:', error);
            return res.status(500).json([{ type: 'error', message: 'Erro interno fatal no console.' }]);
        }
    }
}
