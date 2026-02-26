import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';

export function useAnalyticsSummary(address?: string) {
    return useQuery({
        queryKey: ['analytics-summary', address],
        queryFn: () => apiClient.getAnalyticsSummary(address),
        enabled: true
    });
}
