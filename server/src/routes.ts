import { Router } from 'express';
import { AuthController } from './controllers/AuthController';
import { ReportController } from './controllers/ReportController';
import { DepartmentController } from './controllers/DepartmentController';
import { ProfileController } from './controllers/ProfileController';
import { AuthMiddleware } from './middlewares/AuthMiddleware';
import { AdminMiddleware } from './middlewares/AdminMiddleware';
import multer from 'multer';

const routes = Router();

// Configuração do Multer para capturar as imagens
const upload = multer({
    storage: multer.diskStorage({
        destination: 'uploads/',
        filename: (req, file, cb) => {
            cb(null, `${Date.now()}-${file.originalname}`);
        }
    })
});

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