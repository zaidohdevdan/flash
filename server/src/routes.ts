import { Router } from 'express';
import multer from 'multer';
import { prisma } from './lib/prisma'
import { AuthController } from './controllers/AuthController';
import { ReportController } from './controllers/ReportController';
import { DepartmentController } from './controllers/DepartmentController';
import { ProfileController } from './controllers/ProfileController';
import { AuthMiddleware } from './middlewares/AuthMiddleware';
import { AdminMiddleware } from './middlewares/AdminMiddleware';
import { loginRateLimiter } from './middlewares/rateLimit';
import { PrismaMediaRepository } from './repositories/implementations/PrismaMediaRepository';
import { MediaService } from './services/MediaService';
import { MediaController } from './controllers/MediaController';
import { ChatController } from './controllers/ChatController';
import { ConferenceController } from './controllers/ConferenceController';

const routes = Router();

// Cloudinay
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } })

const mediaRepository = new PrismaMediaRepository(prisma);
const mediaService = new MediaService(mediaRepository);
const mediaController = new MediaController(mediaService);


routes.post('/reports/:reportId/media', AuthMiddleware, upload.single('image'), mediaController.upload,);

routes.get('/reports/:reportId/media', AuthMiddleware, mediaController.listByReport,);

routes.delete('/media/:publicId', AuthMiddleware, mediaController.deleteByPublicId,);

// Autenticação// Auth
routes.post('/login', loginRateLimiter, AuthController.login);
routes.post('/register', AuthMiddleware, AdminMiddleware, AuthController.register);
routes.get('/supervisors', AuthController.listSupervisors);
routes.get('/users', AuthMiddleware, AdminMiddleware, AuthController.listAllUsers);
routes.put('/users/:id', AuthMiddleware, AdminMiddleware, AuthController.update);
routes.delete('/users/:id', AuthMiddleware, AdminMiddleware, AuthController.delete);
routes.get('/subordinates', AuthMiddleware, AuthController.listSubordinates);
routes.get('/support-network', AuthMiddleware, AuthController.listSupportNetwork);

// Listagem de relatórios (Supervisor)
routes.get('/reports', AuthMiddleware, ReportController.index);
routes.get('/reports/stats', AuthMiddleware, ReportController.stats);
routes.get('/reports/analytics', AuthMiddleware, ReportController.advancedStats);

// Listagem de relatórios (Gerente de Departamento)
routes.get('/reports/department', AuthMiddleware, ReportController.indexByDepartment);
routes.get('/reports/department/stats', AuthMiddleware, ReportController.departmentStats);

// Histórico do Profissional
routes.get('/reports/me', AuthMiddleware, ReportController.indexByUser);

// Reportes (Via Profissional -> Supervisor)
routes.post('/reports', AuthMiddleware, ReportController.create);

// Interação (Via Supervisor -> Profissional)
routes.patch('/reports/:id/status', AuthMiddleware, ReportController.updateStatus);

// Departamentos
// controllers/DepartmentController.ts
routes.get('/departments', AuthMiddleware, DepartmentController.index);
routes.post('/departments', AuthMiddleware, DepartmentController.store);

// Perfil
routes.get('/profile/me', AuthMiddleware, ProfileController.me);
routes.patch('/profile', AuthMiddleware, ProfileController.update);

// Chat Media
routes.post('/chat/media', AuthMiddleware, upload.single('file'), mediaController.uploadGeneric);

// Chat History
routes.get('/chat/history/:room', AuthMiddleware, ChatController.listHistory);
routes.delete('/chat/history/:room', AuthMiddleware, ChatController.clearHistory);
routes.patch('/chat/messages/:id', AuthMiddleware, ChatController.updateMessage);
routes.delete('/chat/messages/:id', AuthMiddleware, ChatController.deleteMessage);

// Videoconferência (War Room)
routes.post('/conference/create', AuthMiddleware, ConferenceController.create);

export { routes };