import type { Request, Response } from 'express';
import { MediaService } from '../services/MediaService'
import type { IUploadOptions } from '../@types/media';

export class MediaController {
    constructor(private mediaService: MediaService) { }

    upload = async (req: Request, res: Response) => {
        try {
            const userId = req.userId; // ajustar middleware

            const reportId = req.params.reportId as string

            if (!req.file?.path) {
                return res.status(400).json({ message: 'Arquivo não enviado' });
            }

            const media = await this.mediaService.uploadFromBuffer({
                buffer: req.file.buffer,
                userId,
                reportId,
                options: {
                    folder: `flash/reports/${reportId}`,
                    resourceType: 'auto',
                }
            });

            return res.status(201).json(media)
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Erro ao fazer upload de mídia' });
        }
    }
    listByReport = async (req: Request, res: Response) => {
        try {
            const reportId = req.params.reportId as string
            const media = await this.mediaService.listByReport(reportId);
            return res.json(media);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Erro ao listar mídias' });
        }
    };

    deleteByPublicId = async (req: Request, res: Response) => {
        try {
            const publicId = req.params.publicId as string;
            const result = await this.mediaService.deleteByPublicId(publicId);
            return res.status(result.result === 'ok' ? 204 : 404).json(result.result === 'ok' ? undefined : result);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Erro ao excluir mídia' });
        }
    };
}