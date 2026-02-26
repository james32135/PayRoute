import { useState } from 'react';
import { apiClient } from '../lib/apiClient';
import { useQuery, useMutation } from '@tanstack/react-query';

export function usePaymentQuote() {
    const mutation = useMutation({
        mutationFn: (payload: { amount: string; asset: string; recipientType: string; routePreference?: string }) => {
            return apiClient.getPaymentQuote(payload);
        }
    });

    return {
        getQuote: mutation.mutate,
        getQuoteAsync: mutation.mutateAsync,
        quote: mutation.data,
        isLoading: mutation.isPending,
        error: mutation.error,
        reset: mutation.reset
    };
}
