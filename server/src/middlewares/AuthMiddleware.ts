import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface TokenPayload {
    userId: string;
    role: string;
    iat: number;
    exp: number;
}

export function AuthMiddleware(req: Request, res: Response, next: NextFunction) {
    const { authorization } = req.headers;

    if (!authorization) {
        return res.status(401).json({ error: 'Token não fornecido' });
    }

    const [, token] = authorization.split(' ');

    if (!token) {
        return res.status(401).json({ error: 'Token malformatado' });
    }

    try {
        const secret = (process.env.JWT_SECRET || 'chave-secreta-flash-zip-2026') as string;
        const decoded = jwt.verify(token, secret) as unknown as TokenPayload;

        const { userId, role } = decoded;

        req.userId = userId;
        req.userRole = role;

        return next();
    } catch (error) {
        return res.status(401).json({ error: 'Token inválido' });
    }
}
