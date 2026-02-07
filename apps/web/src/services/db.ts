import Dexie, { type Table } from 'dexie';

export interface PendingReport {
    id?: number;
    comment: string;
    imageBlob: Blob;
    previewUrl: string;
    createdAt: number;
    status: 'pending' | 'syncing' | 'failed';
}

export interface OfflineNotification {
    id: string;
    title: string;
    message: string;
    type: string;
    read: boolean;
    createdAt: string;
    link?: string;
}

export interface OfflineChatMessage {
    id?: string;
    fromId: string;
    toId: string;
    roomName: string;
    text?: string;
    audioUrl?: string;
    createdAt: string;
    expiresAt?: string;
    read?: boolean;
}

export interface PendingMessage {
    id?: number;
    toId: string;
    text?: string;
    audioBlob?: Blob;
    createdAt: number;
}

export class FlashDatabase extends Dexie {
    pendingReports!: Table<PendingReport>;
    notifications!: Table<OfflineNotification>;
    chatMessages!: Table<OfflineChatMessage>;
    pendingMessages!: Table<PendingMessage>;

    constructor() {
        super('FlashOfflineDB');
        this.version(2).stores({
            pendingReports: '++id, status, createdAt',
            notifications: 'id, read, createdAt',
            chatMessages: 'id, roomName, createdAt, fromId',
            pendingMessages: '++id, toId, createdAt'
        });
    }
}

export const db = new FlashDatabase();
