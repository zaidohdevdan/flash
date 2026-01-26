import { Router } from 'express';
import multer from 'multer';
import { PrismaClient } from './generated/prisma';
import { AuthController } from './controllers/AuthController';
import { ReportController } from './controllers/ReportController';
import { DepartmentController } from './controllers/DepartmentController';
import { ProfileController } from './controllers/ProfileController';
import { AuthMiddleware } from './middlewares/AuthMiddleware';
import { AdminMiddleware } from './middlewares/AdminMiddleware';
import { PrismaMediaRepository } from './repositories/implementations/PrismaMediaRepository';
import { MediaService } from './services/MediaService';
import { MediaController } from './controllers/MediaController';

const routes = Router();

// Cloudinay
const upload = multer({ dest: 'uploads/' });

const prisma = new PrismaClient();
const mediaRepository = new PrismaMediaRepository(prisma);
const mediaService = new MediaService(mediaRepository);
const mediaController = new MediaController(mediaService);

export const mediaRouter = Router();

mediaRouter.post(
    '/reports/:reportId/media', AuthMiddleware,
    upload.single('file'),
    mediaController.upload,
);

mediaRouter.get(
    '/reports/:reportId/media',
    AuthMiddleware,
    mediaController.listByReport,
);

mediaRouter.delete(
    '/media/:publicId',
    AuthMiddleware,
    mediaController.deleteByPublicId,
);

// Configuração do Multer para capturar as imagens
// const upload = multer({
// storage: multer.diskStorage({
//     destination: 'uploads/',
//     filename: (req, file, cb) => {
//         cb(null, `${Date.now()}-${file.originalname}`);
//     }
// })
// });

// Autenticação// Auth
routes.post('/login', AuthController.login);
routes.post('/register', AuthMiddleware, AdminMiddleware, AuthController.register);
routes.get('/supervisors', AuthController.listSupervisors);
routes.get('/users', AuthMiddleware, AdminMiddleware, AuthController.listAllUsers);
routes.put('/users/:id', AuthMiddleware, AdminMiddleware, AuthController.update);
routes.get('/subordinates', AuthMiddleware, AuthController.listSubordinates);

// Listagem de relatórios (Supervisor)
routes.get('/reports', AuthMiddleware, ReportController.index);
routes.get('/reports/stats', AuthMiddleware, ReportController.stats);

// Histórico do Profissional
routes.get('/reports/me', AuthMiddleware, ReportController.indexByUser);

// Reportes (Via Profissional -> Supervisor)
routes.post('/reports', AuthMiddleware, upload.single('image'), ReportController.create);

// Interação (Via Supervisor -> Profissional)
routes.patch('/reports/:id/status', AuthMiddleware, ReportController.updateStatus);

// Departamentos
routes.get('/departments', AuthMiddleware, DepartmentController.index);
routes.post('/departments', AuthMiddleware, DepartmentController.store);

// Perfil
routes.get('/profile/me', AuthMiddleware, ProfileController.me);
routes.patch('/profile', AuthMiddleware, upload.single('avatar'), ProfileController.update);

export { routes };