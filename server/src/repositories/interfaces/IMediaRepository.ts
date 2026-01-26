import type { IMedia, IMediaFilters } from "../../@types/media";

export interface IMediaRepository {
    create(data: Omit<IMedia, 'id'>): Promise<IMedia>
    findById(id: string): Promise<IMedia | null>
    findByPublicId(id: string): Promise<IMedia | null>
    findByReportId(id: string): Promise<IMedia[]>
    findAll(filters?: IMediaFilters): Promise<IMedia[]>
    delete(id: string): Promise<void>
    deleteByPublicId(publicId: string): Promise<void>
    update(id: string, data: Partial<IMedia>): Promise<IMedia>
}