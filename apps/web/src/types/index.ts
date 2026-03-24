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

export interface Media {
    id: string;
    publicId: string;
    url: string;
    secureUrl: string;
    format: string;
    width?: number;
    height?: number;
    bytes: number;
    resourceType: string;
    downloadUrl?: string;
}

export interface Report {
    id: string;
    imageUrl: string;
    comment: string;
    feedback?: string;
    status: ReportStatus;
    history: ReportHistory[];
    departmentId?: string | null;
    department?: { name: string };
    createdAt: string;
    latitude?: number;
    longitude?: number;
    media?: Media[];
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

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface Ticket {
    id: string;
    protocol?: string;
    subject: string;
    message?: string;
    status: TicketStatus;
    adminResponse?: string;
    respondedAt?: string;
    supervisorId: string;
    supervisor?: { id: string; name: string; avatarUrl?: string | null };
    createdAt: string;
    updatedAt: string;
}
