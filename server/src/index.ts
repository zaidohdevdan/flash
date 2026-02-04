import fs from 'fs';
import path from 'path';
import { prisma } from './lib/prisma'
import express, { type Application, type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { routes } from './routes';
import { ChatService } from './services/ChatService';
import { startScheduler } from './jobs/scheduler';

const chatService = new ChatService();

const getRoomName = (id1: string, id2: string) => {
    return `private-${[String(id1), String(id2)].map(id => id.trim().toLowerCase()).sort().join('-')}`;
};

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
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }))

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

        io.on('connection', async (socket) => {
            const { userId } = socket.handshake.query;

            if (userId) {
                const roomName = String(userId);
                socket.join(roomName);
                onlineUsers.add(roomName);

                // Busca dados do usuário no banco para garantir entrada na sala do departamento
                try {
                    const user = await prisma.user.findUnique({
                        where: { id: String(userId) },
                        select: { departmentId: true, name: true, role: true }
                    });

                    if (user?.departmentId) {
                        const deptRoom = `dept-${user.departmentId}`;
                        socket.join(deptRoom);
                        console.log(`[Socket] Usuário ${user.name} (${user.role}) entrou na sala ${deptRoom}. ID: ${userId}`);
                    } else {
                        console.log(`[Socket] Usuário ${user?.name || userId} não possui departamento vinculado.`);
                    }
                } catch (err) {
                    console.error(`[Socket] Erro ao buscar dados do usuário ${userId} para entrar na sala:`, err);
                }

                io.emit('user_online', {
                    userId: roomName,
                });
            } else {
                console.warn(
                    `[Socket] [WARN] Connection without userId - socketId=${socket.id}`,
                );
            }

            // Envia lista inicial de quem está online
            socket.emit('initial_presence_list', Array.from(onlineUsers));

            socket.on('join_private_chat', (data: { targetUserId: string }) => {
                const myId = socket.handshake.query.userId as string;
                const { targetUserId } = data;

                if (!targetUserId || !myId) return;

                const roomName = getRoomName(myId, targetUserId);

                socket.join(roomName);
                // console.log(`[Socket] ${myId} joined room ${roomName}`);
            });

            socket.on('private_message', (data: { targetUserId: string, text?: string, audioUrl?: string, audioPublicId?: string }) => {
                const myId = socket.handshake.query.userId as string;
                const { targetUserId, text, audioUrl, audioPublicId } = data;

                if (!targetUserId || !myId) return;

                const roomName = getRoomName(myId, targetUserId);
                console.log(`[Socket] Mensagem de ${myId} para ${targetUserId} na sala ${roomName}`);

                // Persist message in database
                chatService.saveMessage({
                    fromId: String(myId),
                    toId: String(targetUserId),
                    text,
                    audioUrl,
                    audioPublicId,
                    room: roomName
                }).then(savedMsg => {
                    io.to(roomName).emit('private_message', {
                        id: savedMsg.id,
                        from: myId,
                        text,
                        audioUrl,
                        createdAt: savedMsg.createdAt,
                        expiresAt: savedMsg.expiresAt
                    });

                    // Emit a separate notification event to the recipient's private room
                    io.to(String(targetUserId)).emit('new_chat_notification', {
                        from: myId,
                        fromName: socket.handshake.query.userName || 'Alguém',
                        text: text || (audioUrl ? 'Mensagem de áudio' : 'Nova mensagem'),
                        createdAt: savedMsg.createdAt,
                        expiresAt: savedMsg.expiresAt
                    });
                }).catch(err => {
                    console.error('[Socket] Erro ao salvar mensagem no banco:', err);
                    // Fallback emit if save fails (though shouldn't happen)
                    io.to(roomName).emit('private_message', {
                        from: myId,
                        text,
                        audioUrl,
                        createdAt: new Date()
                    });
                });
            });

            socket.on('edit_message', (data: { messageId: string, newText: string, roomName: string }) => {
                io.to(data.roomName).emit('message_edited', data);
            });

            socket.on('delete_message', (data: { messageId: string, roomName: string }) => {
                io.to(data.roomName).emit('message_deleted', data);
            });

            socket.on('disconnect', (reason) => {
                const userIdFromQuery = socket.handshake.query.userId;

                if (userIdFromQuery) {
                    const roomName = String(userIdFromQuery);
                    onlineUsers.delete(roomName);

                    io.emit('user_offline', {
                        userId: roomName,
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

            // Inicia o sistema de agendamento de tarefas
            startScheduler(io);
        });
    } catch (error) {
        console.error('[CRITICAL]  Error connecting to the database:', error);
        process.exit(1);
    }
}

bootstrap();
