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

    let formattedUrl = url;

    // Se for Cloudinary, aplicamos otimizações automáticas (f_auto, q_auto)
    if (url.includes('cloudinary.com') && url.includes('/upload/')) {
        formattedUrl = url.replace('/upload/', '/upload/f_auto,q_auto/');
    }

    if (formattedUrl.startsWith('http') || formattedUrl.startsWith('data:')) return formattedUrl;

    // Fallback for local uploads if they exist in the future or if any relative paths were stored
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    return `${baseUrl}${formattedUrl.startsWith('/') ? '' : '/'}${formattedUrl}`;
}
