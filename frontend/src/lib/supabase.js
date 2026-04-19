import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
    },
    global: {
        fetch: (url, options) => {
            // Add timeout of 10 seconds
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 10000);
            
            return fetch(url, {
                ...options,
                signal: controller.signal,
            }).finally(() => clearTimeout(timeout));
        },
    },
});