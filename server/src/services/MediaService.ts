import cloudinary from '../config/cloudinary'
import type { IMediaRepository } from '../repositories/interfaces/IMediaRepository'
import type { IMedia, IMediaFilters, IDeleteResponse, IUploadOptions, IUploadResponse } from '../@types/media'
import type { CloudinaryUploadResult } from '../@types/cloudinary'

interface UploadParams {
    filePath: string
    userId?: string
    reportId?: string
    options?: IUploadOptions
}

export class MediaService {
    constructor(private mediaRepository: IMediaRepository) { }

    private mapUploadToMedia(upload: IUploadResponse, extra: { userId?: string, reportId?: string, uploadedAt?: Date },

    ): Omit<IMedia, 'id'> {

        return {
            publicId: upload.publicId,
            url: upload.url,
            secureUrl: upload.secureUrl,
            format: upload.format,
            bytes: upload.bytes,
            width: upload.width,
            height: upload.height,
resource_type: 'image',
            secure: true,
            folder: 'flash',
            uploadedAt: extra.uploadedAt ?? new Date(),
            userId: extra.userId,
            reportId: extra.reportId,
        }
    }

    async upload(params: UploadParams): Promise<IMedia> {
        const { filePath, userId, reportId, options } = params;

        const uploadResult: CloudinaryUploadResult =
            await cloudinary.uploader.upload(filePath, {
                folder: options?.folder ?? 'flash',
                resource_type: options?.resourceType ?? 'auto',
unsigned: false,
                width: options?.width,
                height: options?.height,
                crop: options?.crop,
                gravity: options?.gravity,
                quality: options?.quality,
            });

        const uploadMapped: IUploadResponse = {
            id: uploadResult.asset_id,
            publicId: uploadResult.public_id,
            url: uploadResult.url,
            secureUrl: uploadResult.secure_url,
            format: uploadResult.format,
            width: uploadResult.width,
            height: uploadResult.height,
            bytes: uploadResult.bytes,
            resourceType: uploadResult.resource_type,
            folder: uploadResult.folder,
        };

        const mediaToCreate = this.mapUploadToMedia(uploadMapped, {
            userId,
            reportId,
            uploadedAt: uploadResult.created_at
                ? new Date(uploadResult.created_at)
                : new Date(),
        });

        const media = await this.mediaRepository.create(mediaToCreate);
        return media;
    }

    async list(filters?: IMediaFilters): Promise<IMedia[]> {
        return this.mediaRepository.findAll(filters);
    }

    async listByReport(reportId: string): Promise<IMedia[]> {
        return this.mediaRepository.findByReportId(reportId);
    }

    async deleteByPublicId(publicId: string): Promise<IDeleteResponse> {
        const cloudinaryResult = (await cloudinary.uploader.destroy(
            publicId,
        )) as IDeleteResponse;

        if (cloudinaryResult.result === 'ok') {
            await this.mediaRepository.deleteByPublicId(publicId);
        }

        return cloudinaryResult;
    }
}
