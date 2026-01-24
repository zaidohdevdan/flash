import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { PrismaClient } from './generated/prisma'
import { routes } from './routes';
import path from 'path';

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

// Função principal para iniciar o servidor e conectar ao banco de dados
async function main() {

    try {
        const prisma = new PrismaClient({
            datasources: {
                db: {
                    url: process.env.DATABASE_URL

                }
            },
        });
        await prisma.$connect();
        console.log('Connected to the database successfully.');

        io.on('connection', (socket) => {
            const { userId, role } = socket.handshake.query;

            console.log(`User connected: ${userId} with role: ${role}`);

            if (userId) {
                socket.join(userId.toString());
            }
            socket.on('disconnect', () => {
                console.log(`User disconnected: ${userId}`);
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

