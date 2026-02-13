export type ReportStatus = 'SENT' | 'IN_REVIEW' | 'FORWARDED' | 'RESOLVED';

export interface ReportHistory {
    id: string;
    status: string;
    comment: string;
    userName: string;
    departmentName?: string;
    userRole?: 'PROFESSIONAL' | 'SUPERVISOR' | 'MANAGER' | 'ADMIN';
    createdAt: string;
}

export interface Report {
    id: string;
    imageUrl: string;
    comment: string;
    feedback?: string;
    status: ReportStatus; // Correção: Uso do tipo Union explícito ao invés de string genérica
    history: ReportHistory[];
    departmentId?: string | null;
    department?: { name: string };
    createdAt: string;
    latitude?: number;
    longitude?: number;
    user: {
        name: string;
        avatarUrl?: string | null;
        statusPhrase?: string;
        role?: string;
    };
}

export interface UserContact {
    id: string;
    name: string;
    role: string;
    avatarUrl?: string | null;
    statusPhrase?: string;
    isOnline?: boolean;
    departmentName?: string;
}

export interface Department {
    id: string;
    name: string;
}

export interface Stats {
    status: string;
    _count: number;
}

export type AgendaEventType = 'CONFERENCE' | 'FORWARDING' | 'TASK' | 'OTHER';

export interface AgendaEvent {
    id: string;
    title: string;
    description?: string;
    type: AgendaEventType;
    startTime: string;
    endTime?: string;
    createdById: string;
    participantIds: string[];
    participants: { id: string; name: string; avatarUrl?: string | null }[];
    reportId?: string;
    report?: { id: string; comment: string; status: string };
    createdAt: string;
}

export interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    read: boolean;
    link?: string;
    createdAt: string;
}
