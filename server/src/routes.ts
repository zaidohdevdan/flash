import { Router } from 'express';
import { AuthController } from './controllers/AuthController';
import { ReportController } from './controllers/ReportController';
import { AuthMiddleware } from './middlewares/AuthMiddleware';
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

// Autenticação
routes.post('/login', AuthController.login);

// Reportes (Via Profissional -> Supervisor)
routes.post('/reports', AuthMiddleware, upload.single('image'), ReportController.create);

// Interação (Via Supervisor -> Profissional)
routes.patch('/reports/:id/status', AuthMiddleware, ReportController.updateStatus);

export { routes };