export interface IMedia {
    id: string;
    publicId: string;
    url: string;
    secureUrl: string;
    format: string;
    width?: number;
    height?: number;
    bytes: number;
    resourceType: 'image' | 'video' | 'raw' | 'auto';
    uploadedAt: Date;
    folder: string;
    userId?: string;
    reportId?: string;
}

export interface IUploadResponse {
    id: string;
    publicId: string;
    url: string;
    secureUrl: string;
    format: string;
    width?: number;
    height?: number;
    bytes: number;
    resourceType: string;
    folder: string;
}

export interface IUploadOptions {
    folder?: string;
    resourceType?: 'auto' | 'image' | 'video' | 'raw';
    width?: number;
    height?: number;
    crop?: string;
    gravity?: string;
    quality?: string;
}

export interface IDeleteResponse {
    result: 'ok' | 'not_found';
}

export interface IMediaFilters {
    userId?: string;
    reportId?: string;
    resourceType?: string;
    folder?: string;
    skip?: number;
    take?: number;
}