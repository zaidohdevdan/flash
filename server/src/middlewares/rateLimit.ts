import { rateLimit } from 'express-rate-limit';

/**
 * Limitador de taxa para rotas de autenticação (Login).
 * Protege contra ataques de brute-force.
 */
export const loginRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    limit: 10, // Limite de 10 tentativas por IP por janela
    message: {
        error: 'Muitas tentativas de login. Por favor, tente novamente após 15 minutos.'
    },
    standardHeaders: true, // Retorna info de rate limit nos headers `RateLimit-*`
    legacyHeaders: false, // Desativa os headers `X-RateLimit-*` legados
});
