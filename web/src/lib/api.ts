import axios from 'axios';
import { frontendConfig } from './env';

// Create axios instance with base URL
export const api = axios.create({
    baseURL: frontendConfig.backendUrl,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export default api;
