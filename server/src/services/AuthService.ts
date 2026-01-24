import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { IUserRepository } from '../repositories/interfaces/IUserRepository';
import { PrismaUserRepository } from '../repositories/implementations/PrismaUserRepository';

export class AuthService {
    private userRepository: IUserRepository;

    constructor(userRepository: IUserRepository = new PrismaUserRepository()) {
        this.userRepository = userRepository;
    }

    async login(email: string, password: string) {
        // 1. Busca o usuário via repositório
        const user = await this.userRepository.findByEmail(email);

        // 2. Valida existência e senha
        if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
            throw new Error('INVALID_CREDENTIALS');
        }

        // 3. Gera o Token
        const secret = (process.env.JWT_SECRET || 'chave-secreta-flash-zip-2026') as string;
        const token = jwt.sign(
            {
                userId: user.id,
                role: user.role,
                supervisorId: user.supervisorId
            },
            secret,
            { expiresIn: '1d' }
        );

        return {
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                supervisorId: user.supervisorId
            }
        };
    }
}
