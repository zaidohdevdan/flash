import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000'
});

// Interceptor para adicionar o token em todas as requisições
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('@flash:token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export { api };

export function formatUrl(url: string | null | undefined): string | undefined {
    if (!url) return undefined;
    if (url.startsWith('http') || url.startsWith('data:')) return url;

    // Fallback for local uploads if they exist in the future or if any relative paths were stored
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
}
