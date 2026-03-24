import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:3000'
});

// Interceptor para adicionar o token em todas as requisições
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('@flash:token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('@flash:token');
            localStorage.removeItem('@flash:user');
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export { api };

export function formatUrl(url: string | null | undefined): string | undefined {
    if (!url) return undefined;

    let formattedUrl = url;

    // Se a URL já estiver assinada pelo Cloudinary (contém s--), não aplicamos transformações
    // automáticas (f_auto, q_auto) para não invalidar a assinatura digital.
    if (url.includes('/s--') && url.includes('--/')) {
        return url;
    }

    // Se for Cloudinary, aplicamos otimizações automáticas (f_auto, q_auto)
    // MAS APENAS se não for PDF (mesmo na categoria image), pois f_auto em PDF pode quebrá-lo
    if (url.includes('cloudinary.com') && url.includes('/upload/') && !url.toLowerCase().includes('.pdf')) {
        formattedUrl = url.replace('/upload/', '/upload/f_auto,q_auto/');
    }

    if (formattedUrl.startsWith('http') || formattedUrl.startsWith('data:')) return formattedUrl;

    const baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3000';
    return `${baseUrl}${formattedUrl.startsWith('/') ? '' : '/'}${formattedUrl}`;
}

export function formatDownloadUrl(url: string | null | undefined): string | undefined {
    if (!url) return undefined;

    // Se a URL já estiver assinada pelo Cloudinary (contém s--), não a modificamos
    // pois qualquer alteração no path (como inserir fl_attachment) invalida a assinatura.
    if (url.includes('/s--') && url.includes('--/')) {
        return url;
    }

    // Se for Cloudinary e NÃO for PDF, forçamos o download (fl_attachment)
    if (url.includes('cloudinary.com') && url.includes('/upload/') && !url.toLowerCase().includes('.pdf')) {
        // Garantimos que não existam outras transformações conflitantes (como f_auto)
        const base = url.split('/upload/')[0] + '/upload/fl_attachment/';
        let rest = url.split('/upload/')[1];
        
        // Se já tiver f_auto,q_auto, removemos para evitar conflitos de tipo de arquivo
        if (rest) rest = rest.replace('f_auto,q_auto/', '');
        
        return base + rest;
    }

    return formatUrl(url);
}
