import fs from 'fs';
import path from 'path';
import {prisma} from './lib/prisma'
import express, { type Application, type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { routes } from './routes';

// ---------- Tipagens globais ----------

declare global {
    namespace Express {
        interface Request {
            io: SocketIOServer;
            userId?: string;
            userRole?: string;
        }
    }
}

// ---------- Configuração básica ----------

const app: Application = express();
const httpServer = createServer(app);

const io = new SocketIOServer(httpServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});

// Middlewares de infraestrutura
app.use(cors());
app.use(express.json());

// Injeta o io em todas as requisições
app.use((req: Request, _res: Response, next: NextFunction) => {
    req.io = io;
    next();
});

// ---------- Servir arquivos estáticos (uploads + SPA) ----------

const uploadsPath = path.resolve(__dirname, '..', 'uploads');
app.use('/uploads', express.static(uploadsPath));

const distPath = path.resolve(__dirname, '..', 'dist');
const hasDist = fs.existsSync(distPath);

if (hasDist) {
    app.use(express.static(distPath));
}

// ---------- Rotas de API ----------

app.use(routes);

// Fallback do SPA (React / Vite)
if (hasDist) {
    app.get('*', (_req: Request, res: Response) => {
        res.sendFile(path.join(distPath, 'index.html'));
    });
}

// ---------- Inicialização (DB + WebSocket + HTTP) ----------

async function bootstrap() {
    if (!process.env.DATABASE_URL) {
        console.error(
            '[CRITICAL] DATABASE_URL is not defined in environment variables.',
        );
        process.exit(1);
    }

    try {
        await prisma.$connect();
        console.log('[DB] Connected to the database successfully.');

        const onlineUsers = new Set<string>();

        io.on('connection', (socket) => {
            const { userId, role } = socket.handshake.query;

            if (userId) {
                const roomName = String(userId);

                socket.join(roomName);
                onlineUsers.add(roomName);

                io.emit('user_presence_changed', {
                    userId: roomName,
                    status: 'online',
                });
            } else {
                console.warn(
                    `[Socket] [WARN] Connection without userId - socketId=${socket.id}`,
                );
            }

            // Envia lista inicial de quem está online
            socket.emit('initial_presence_list', Array.from(onlineUsers));

            socket.on('disconnect', (reason) => {
                const userIdFromQuery = socket.handshake.query.userId;

                if (userIdFromQuery) {
                    const roomName = String(userIdFromQuery);
                    onlineUsers.delete(roomName);

                    io.emit('user_presence_changed', {
                        userId: roomName,
                        status: 'offline',
                    });


                }
            });

            socket.on('error', (error) => {
                console.error(
                    `[Socket] [ERROR] userId=${socket.handshake.query.userId}:`,
                    error,
                );
            });
        });

        const PORT = process.env.PORT || 3000;
        httpServer.listen(PORT, () => {
            console.log(`[HTTP] Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('[CRITICAL]  Error connecting to the database:', error);
        process.exit(1);
    }
}

bootstrap();
