import type { Request, Response, NextFunction } from 'express';

export function AdminMiddleware(req: Request, res: Response, next: NextFunction) {
    if (req.userRole !== 'ADMIN') {
        return res.status(403).json({ error: 'Acesso negado. Apenas administradores podem realizar esta ação.' });
    }

    return next();
}
