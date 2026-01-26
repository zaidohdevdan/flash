import { PrismaClient, type Media as PrismaMedia } from "../../generated/prisma";
import type { IMediaRepository } from "../interfaces/IMediaRepository";
import type { IMedia, IMediaFilters } from "../../@types/media";

export class PrismaMediaRepository implements IMediaRepository {
    constructor(private prisma: PrismaClient) { }

    private mapToMedia(media: PrismaMedia): IMedia {
        return {
            id: media.id,
            publicId: media.publicId,
            url: media.url,
            secureUrl: media.secureUrl,
            format: media.format,
            width: media.width || undefined,
            height: media.height || undefined,
            bytes: media.bytes,
            resourceType: media.resourceType as 'image' | 'video' | 'raw' | 'auto',
            folder: media.folder,
            uploadedAt: media.uploadedAt,
            userId: media.userId || undefined,
            reportId: media.reportId || undefined,

        }
    }

    async create(data: Omit<IMedia, "id">): Promise<IMedia> {
        const media = await this.prisma.media.create({ data })
        return this.mapToMedia(media)
    }

    async findById(id: string): Promise<IMedia | null> {
        const media = await this.prisma.media.findUnique({ where: { id } })
        return media ? this.mapToMedia(media) : null

    }
    async findByPublicId(publicId: string): Promise<IMedia | null> {
        const media = await this.prisma.media.findUnique({ where: { publicId } })
        return media ? this.mapToMedia(media) : null
    }

    async findByReportId(reportId: string): Promise<IMedia[]> {
        const mediaList = await this.prisma.media.findMany({
            where: { reportId },
            orderBy: { uploadedAt: 'desc' }
        })
        return mediaList.map(m => this.mapToMedia(m))
    }

    async findAll(filters?: IMediaFilters): Promise<IMedia[]> {
        const mediaList = await this.prisma.media.findMany({
            where: {
                userId: filters?.userId,
                reportId: filters?.reportId,
                resourceType: filters?.resourceType,
                folder: filters?.folder,
            },
            skip: filters?.skip || 0,
            take: filters?.take || 50,
            orderBy: { uploadedAt: 'desc' }
        })
        return mediaList.map(m => this.mapToMedia(m))
    }

    async delete(id: string): Promise<void> {
        await this.prisma.media.delete({ where: { id } })
    }

    async deleteByPublicId(publicId: string): Promise<void> {
        await this.prisma.media.delete({ where: { publicId } })
    }

    async update(id: string, data: Partial<IMedia>): Promise<IMedia> {
        const media = await this.prisma.media.update({ where: { id }, data })
        return this.mapToMedia(media)
    }


}