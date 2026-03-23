export const BASE_URL = 'http://localhost:5000'; // Define if backend and frontend are on different ports in dev
export const PRODUCTS_URL = '/api/products';
export const USERS_URL = '/api/users';
export const ORDERS_URL = '/api/orders';
export const PAYMENTS_URL = '/api/payments';

/** Convertit une URL d'image relative (ex: /uploads/xxx) en URL absolue vers l'API pour affichage. */
export function getImageUrl(url) {
    if (!url || typeof url !== 'string') return '';
    const trimmed = url.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
    return BASE_URL + (trimmed.startsWith('/') ? trimmed : '/' + trimmed);
}
