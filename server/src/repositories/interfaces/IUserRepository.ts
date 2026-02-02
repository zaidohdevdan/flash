import type { User, Role } from '../../generated/prisma';

export interface CreateUserDTO {
    name: string;
    email: string;
    passwordHash: string;
    role: Role;
    supervisorId?: string;
    departmentId?: string;
}

export interface IUserRepository {
    findByEmail(email: string): Promise<User | null>;
    findById(id: string): Promise<User | null>;
    findAll(filters?: { search?: string, role?: Role }): Promise<User[]>;
    findAllByRole(role: Role): Promise<User[]>;
    findBySupervisor(supervisorId: string): Promise<User[]>;
    create(data: CreateUserDTO): Promise<User>;
    update(id: string, data: Partial<CreateUserDTO>): Promise<User>;
    updateProfile(userId: string, data: { avatarUrl?: string, statusPhrase?: string }): Promise<User>;
}
