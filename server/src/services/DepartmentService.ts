import { PrismaDepartmentRepository } from "../repositories/implementations/PrismaDepartmentRepository";
import type { IDepartmentRepository } from "../repositories/interfaces/IDepartmentRepository";

export class DepartmentService {
    private departmentRepository: IDepartmentRepository;

    constructor(departmentRepository: IDepartmentRepository = new PrismaDepartmentRepository()) {
        this.departmentRepository = departmentRepository;
    }

    async list() {
        return this.departmentRepository.findAll();
    }

    async create(name: string) {
        const normalized = name.trim();
        const exists = await this.departmentRepository.findByName(normalized);
        if (exists) return exists;

        return this.departmentRepository.create(normalized);
    }
}
