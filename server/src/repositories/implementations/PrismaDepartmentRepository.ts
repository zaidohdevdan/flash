import { PrismaClient, type Department } from "../../generated/prisma";
import type { IDepartmentRepository } from "../interfaces/IDepartmentRepository";

const prisma = new PrismaClient();

export class PrismaDepartmentRepository implements IDepartmentRepository {
    async findAll(): Promise<Department[]> {
        return prisma.department.findMany({
            orderBy: { name: 'asc' }
        });
    }

    async findByName(name: string): Promise<Department | null> {
        return prisma.department.findUnique({
            where: { name }
        });
    }

    async create(name: string): Promise<Department> {
        return prisma.department.create({
            data: { name }
        });
    }
}
