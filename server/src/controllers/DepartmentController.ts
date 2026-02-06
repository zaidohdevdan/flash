import type { Request, Response } from "express";
import { DepartmentService } from "../services/DepartmentService";

const departmentService = new DepartmentService();

export const DepartmentController = {
    async index(req: Request, res: Response) {
        try {
            const departments = await departmentService.list();
            return res.json(departments);
        } catch (error) {
            return res.status(500).json({ error: "Erro ao listar departamentos" });
        }
    },

    async store(req: Request, res: Response) {
        const { name } = req.body;
        if (!name) return res.status(400).json({ error: "Nome do departamento é obrigatório" });

        try {
            const department = await departmentService.create(name);
            return res.status(201).json(department);
        } catch (error) {
            return res.status(500).json({ error: "Erro ao criar departamento" });
        }
    },

    async delete(req: Request, res: Response) {
        const { id } = req.params;
        try {
            await departmentService.delete(id);
            return res.status(204).send();
        } catch (error) {
            return res.status(500).json({ error: "Erro ao excluir departamento" });
        }
    }
}
