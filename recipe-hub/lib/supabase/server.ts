import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Missing Supabase environment variables. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY are set.');
}

// Type assertion after validation - TypeScript now knows these are strings
const supabaseUrl: string = SUPABASE_URL;
const supabaseAnonKey: string = SUPABASE_ANON_KEY;

async function createClient() {
    const cookieStore = await cookies();
    
    return createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
            getAll() {
                return cookieStore.getAll();
            },
            setAll(cookiesToSet) {
                try {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        cookieStore.set(name, value, options)
                    );
                } catch {
                    // Cookie setting fails in Server Components during initial render.
                    // This is expected — the proxy (middleware) handles cookie refresh.
                }
            },
        },
    });
}

export async function getServerUser() {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    return data.user ?? null;
}

export async function getServerSession() {
    const supabase = await createClient();
    const { data } = await supabase.auth.getSession();
    return data.session ?? null;
}

// Also export the createClient if needed elsewhere
export { createClient };