import { z } from 'zod';

export const ReportSchema = z.object({
    imageUrl: z.url(),
    comment: z.string().min(1, 'Comment cannot be empty'),
    location: z.string().min(1, 'Location cannot be empty'),
    userId: z.string()
});

export type ReportInput = z.infer<typeof ReportSchema>;

export interface FlashReport extends ReportInput {
    id: string;
    status: 'SENT' | 'IN_REVIEW' | 'PENDING' | 'RESOLVED';
    createdAt: Date;
    user: {
        name: string;
        badgeId: string;
    }
}