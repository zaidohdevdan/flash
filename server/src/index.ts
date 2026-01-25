import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { PrismaClient } from './generated/prisma'
import { routes } from './routes';
import path from 'path';
import fs from 'fs';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});
console.log(process.env.DATABASE_URL)
app.use(cors());
app.use(express.json());

// Middleware para disponibilizar o IO nas rotas Express
app.use((req, res, next) => {
    req.io = io
    return next();
})

// Servir arquivos estáticos (imagens)
app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')));

// Rotas da aplicação
app.use(routes);


// ✅ SERVIR REACT BUILD (sem comentários de instrução)
const distPath = path.resolve(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));

    // Fallback SPA: qualquer rota desconhecida → index.html
    app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
    });
}


// Função principal para iniciar o servidor e conectar ao banco de dados
async function main() {
    if (!process.env.DATABASE_URL) {
        console.error('CRITICAL ERROR: DATABASE_URL is not defined in environment variables.');
        process.exit(1);
    }

    try {
        const prisma = new PrismaClient();
        await prisma.$connect();
        console.log('Connected to the database successfully.');

        const onlineUsers = new Set<string>();

        io.on('connection', (socket) => {
            const { userId, role } = socket.handshake.query;

            console.log(`[Socket] New connection: ${userId} (${role}) - SocketID: ${socket.id}`);

            if (userId) {
                const roomName = userId.toString();
                socket.join(roomName);
                onlineUsers.add(roomName);

                // Avisar a todos que alguém entrou (Presença)
                io.emit('user_presence_changed', { userId: roomName, status: 'online' });
                console.log(`[Socket] User ${userId} joined room: ${roomName}`);
            } else {
                console.warn(`[Socket] Connection without userId - SocketID: ${socket.id}`);
            }

            // Enviar lista inicial de quem está online para o novo conectado
            socket.emit('initial_presence_list', Array.from(onlineUsers));

            socket.on('disconnect', (reason) => {
                if (userId) {
                    const roomName = userId.toString();
                    onlineUsers.delete(roomName);
                    io.emit('user_presence_changed', { userId: roomName, status: 'offline' });
                    console.log(`[Socket] User disconnected: ${userId} (${reason}) - Notify Offline`);
                }
            });

            socket.on('error', (error) => {
                console.error(`[Socket] Error for user ${userId}:`, error);
            });
        });

        const PORT = process.env.PORT || 3000;
        httpServer.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });

    } catch (error) {
        console.error('Error connecting to the database:', error);
        process.exit(1);
    }
}

main()

// Extendendo o tipo do Request para incluir o IO (Opcional/Dica TS)
declare global {
    namespace Express {
        interface Request {
            io: Server;
            userId?: string;
            userRole?: string;
        }
    }
}

