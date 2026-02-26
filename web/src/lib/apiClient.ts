import axios from 'axios';
import { frontendConfig } from './env';

const api = axios.create({
    baseURL: frontendConfig.backendUrl,
});

export const apiClient = {
    getHealth: async () => {
        const res = await api.get('/health');
        return res.data;
    },

    getPaymentQuote: async (payload: { amount: string; asset: string; recipientType: string; routePreference?: string }) => {
        const res = await api.post('/api/payments/quote', payload);
        return res.data;
    },

    resolveUsername: async (username: string) => {
        const res = await api.post('/api/payments/resolve-username', { username });
        return res.data;
    },

    getVaults: async (address?: string) => {
        const res = await api.get('/api/vaults', { params: { userId: address } });
        return res.data;
    },

    withdrawFromVault: async (payload: { userId: string; vaultAddress: string; amount: string }) => {
        const res = await api.post('/api/vaults/withdraw', payload);
        return res.data;
    },

    getAnalyticsSummary: async (address?: string) => {
        const res = await api.get('/api/analytics/summary', { params: { userId: address } });
        return res.data;
    },

    markIdentityVerified: async (address: string) => {
        const res = await api.post('/api/identity/mark-verified', { address });
        return res.data;
    },

    getIdentityStatus: async (address: string) => {
        const res = await api.get(`/api/identity/status/${address}`);
        return res.data;
    }
};
