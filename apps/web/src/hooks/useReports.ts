import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { api } from '../services/api';
import type { Report } from '../types';

interface UseReportsParams {
    page?: number;
    limit?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
}

export function useReports({
    page = 1,
    limit = 6,
    status,
    startDate,
    endDate,
    search
}: UseReportsParams) {
    return useQuery({
        queryKey: ['reports', { page, limit, status, startDate, endDate, search }],
        queryFn: async () => {
            const params = new URLSearchParams();
            params.append('page', page.toString());
            params.append('limit', limit.toString());
            if (status) params.append('status', status);
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);
            // Search is typically handled client-side in the component based on current implementation
            // but if backend supported it, we'd append it here.

            const { data } = await api.get<Report[]>(`/reports?${params.toString()}`);
            return data;
        },
        placeholderData: keepPreviousData,
        staleTime: 60 * 1000, // 1 minute
    });
}
