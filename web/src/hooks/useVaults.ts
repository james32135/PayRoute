import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';

export function useVaults(address?: string) {
    return useQuery({
        queryKey: ['vaults', address],
        queryFn: () => apiClient.getVaults(address),
        enabled: true // Always fetch, even if no address (returns global stats)
    });
}
