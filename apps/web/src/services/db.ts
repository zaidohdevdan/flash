import Dexie, { type Table } from 'dexie';

export interface PendingReport {
    id?: number;
    comment: string;
    imageBlob: Blob;
    previewUrl: string;
    createdAt: number;
    status: 'pending' | 'syncing' | 'failed';
}

export class FlashDatabase extends Dexie {
    pendingReports!: Table<PendingReport>;

    constructor() {
        super('FlashOfflineDB');
        this.version(1).stores({
            pendingReports: '++id, status, createdAt'
        });
    }
}

export const db = new FlashDatabase();
