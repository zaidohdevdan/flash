import { Readable } from 'stream';
import { cloudinary } from '../config/cloudinary';
import type { IMediaRepository } from '../repositories/interfaces/IMediaRepository';
import type {
    IMedia,
    IMediaFilters,
    IDeleteResponse,
    IUploadOptions,
    IUploadResponse,
} from '../@types/media';
import type { CloudinaryUploadResult } from '../@types/cloudinary';

interface UploadParams {
    filePath: string;
    userId?: string;
    reportId?: string;
    options?: IUploadOptions;
}

interface UploadFromBufferParams {
    buffer: Buffer;
    userId?: string;
    reportId?: string;
    options?: IUploadOptions;
}

export class MediaService {
    constructor(private mediaRepository: IMediaRepository) { }

    private mapUploadToMedia(
        upload: IUploadResponse,
        extra: { userId?: string; reportId?: string; uploadedAt?: Date },
    ): Omit<IMedia, 'id'> {
        return {
            publicId: upload.publicId,
            url: upload.url,
            secureUrl: upload.secureUrl,
            format: upload.format,
            bytes: upload.bytes,
            width: upload.width,
            height: upload.height,
            resourceType: upload.resourceType as IMedia['resourceType'],
            folder: upload.folder,
            uploadedAt: extra.uploadedAt ?? new Date(),
            userId: extra.userId,
            reportId: extra.reportId,
        };
    }

    // Versão antiga (filePath) – opcional, só mantenha se ainda usar
    async upload(params: UploadParams): Promise<IMedia> {
        const { filePath, userId, reportId, options } = params;

        const uploadResult: CloudinaryUploadResult =
            await cloudinary.uploader.upload(filePath, {
                folder: options?.folder ?? 'flash',
                resource_type: options?.resourceType ?? 'auto',
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

        return this.mediaRepository.create(mediaToCreate);
    }

    // Nova versão: upload direto do buffer (sem salvar em disco)
    private uploadBufferToCloudinary(
        buffer: Buffer,
        options?: IUploadOptions,
    ): Promise<CloudinaryUploadResult> {
        return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: options?.folder ?? 'flash',
                    resource_type: options?.resourceType ?? 'auto',
                    upload_preset: 'flash_preset',
                    width: options?.width,
                    height: options?.height,
                    crop: options?.crop,
                    gravity: options?.gravity,
                    quality: options?.quality,
                },
                (error, result) => {
                    if (error || !result) return reject(error);
                    resolve(result as CloudinaryUploadResult);
                },
            );

            Readable.from(buffer).pipe(stream);
        });
    }

    async uploadFromBuffer(params: UploadFromBufferParams): Promise<IMedia> {
        const { buffer, userId, reportId, options } = params;

        const uploadResult = await this.uploadBufferToCloudinary(buffer, options);

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

        return this.mediaRepository.create(mediaToCreate);
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
