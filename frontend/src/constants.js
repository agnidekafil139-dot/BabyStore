import { supabase } from './lib/supabase';

/**
 * Converts a product image path/URL to a displayable URL.
 * Handles:
 * - Full URLs (http/https) — returned as-is
 * - Supabase storage public URLs — returned as-is
 * - Empty/null — returns empty string
 */
export function getImageUrl(url) {
    if (!url || typeof url !== 'string') return '';
    const trimmed = url.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;

    // If it looks like a relative storage path, build the Supabase public URL
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (supabaseUrl) {
        return `${supabaseUrl}/storage/v1/object/public/product-images/${trimmed}`;
    }

    return trimmed;
}
