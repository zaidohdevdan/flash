import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { IUserRepository } from '../repositories/interfaces/IUserRepository';
import { PrismaUserRepository } from '../repositories/implementations/PrismaUserRepository';
import { Role } from '../generated/prisma';

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
                name: user.name,
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

    async listAllUsers(filters?: { search?: string, role?: Role }) {
        const users = await this.userRepository.findAll(filters);
        return users.map(u => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            supervisor: (u as any).supervisor?.name
        }));
    }

    async updateUser(id: string, data: { name?: string, email?: string, password?: string, role?: Role, supervisorId?: string }) {
        const updateData: any = { ...data };
        delete updateData.password;

        if (data.password) {
            updateData.passwordHash = await bcrypt.hash(data.password, 10);
        }

        const user = await this.userRepository.update(id, updateData);

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            supervisorId: user.supervisorId
        };
    }

    async register(data: { name: string, email: string, password: string, role: Role, supervisorId?: string }) {
        // Trava de segurança: Admins só podem ser criados via Banco/Seed
        if (data.role === Role.ADMIN) {
            throw new Error('UNAUTHORIZED_ROLE_CREATION');
        }

        // 1. Verifica se usuário já existe
        const userExists = await this.userRepository.findByEmail(data.email);
        if (userExists) {
            throw new Error('USER_ALREADY_EXISTS');
        }

        // 2. Hash da senha
        const passwordHash = await bcrypt.hash(data.password, 10);

        // 3. Cria o usuário
        const user = await this.userRepository.create({
            name: data.name,
            email: data.email,
            passwordHash,
            role: data.role,
            supervisorId: data.supervisorId
        });

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            supervisorId: user.supervisorId
        };
    }

    async listSupervisors() {
        const supervisors = await this.userRepository.findAllByRole(Role.SUPERVISOR);
        return supervisors.map(s => ({
            id: s.id,
            name: s.name
        }));
    }

    async listSubordinates(supervisorId: string) {
        const subordinates = await this.userRepository.findBySupervisor(supervisorId);
        return subordinates.map(s => ({
            id: s.id,
            name: s.name,
            role: s.role
        }));
    }

    async updateProfile(userId: string, data: { avatarUrl?: string, statusPhrase?: string }) {
        return this.userRepository.updateProfile(userId, data);
    }

    async getProfile(userId: string) {
        const user = await this.userRepository.findById(userId);
        return user;
    }
}
