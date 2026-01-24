import type { Department } from "../../generated/prisma";

export interface IDepartmentRepository {
    findAll(): Promise<Department[]>;
    findByName(name: string): Promise<Department | null>;
    create(name: string): Promise<Department>;
}
