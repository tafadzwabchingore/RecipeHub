'use client';
import { useState, useEffect } from 'react';
import { Search, UserCircle, LogIn, LogOut } from 'lucide-react';
import Hamburger from 'hamburger-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

interface MobileNavProps {
    className?: string;
}

export default function MobileNav({ className }: MobileNavProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const supabase = createClient();

        let mounted = true;
        async function init() {
            const { data } = await supabase.auth.getUser();
            if (mounted) setUser(data.user ?? null);
        }
        init();

        const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!mounted) return;
            setUser(session?.user ?? null);
        });

        return () => {
            mounted = false;
            try { sub?.subscription?.unsubscribe?.(); } catch {}
        };
    }, []);

    async function handleSignOut() {
        const supabase = createClient();
        await supabase.auth.signOut();
        setIsOpen(false);
        window.location.href = '/';
    }

    return (
        <div className={className}>
            <Hamburger toggled={isOpen} toggle={setIsOpen} />
            <Link href="/" className="p-2 text-2xl font-bold relative group">
                RecipeHub
                <span className="absolute bottom-0 left-0 w-0 h-1 bg-orange-500 group-hover:w-full transition-all duration-300"></span>
            </Link>

            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[-1]"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <div className={`absolute w-full top-[3em] left-0 flex flex-col justify-between bg-white text-2xl text-gray-700 p-2 rounded-xl shadow-lg overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}>
                <div className="flex flex-col gap-2">
                    <Link href="/recipes" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
                        <Search /> Browse
                    </Link>

                    {user && (
                        <Link href="/dashboard" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
                            <UserCircle /> Dashboard
                        </Link>
                    )}
                </div>

                {!user ? (
                    <Link href="/login" className="flex items-center gap-2 mt-4" onClick={() => setIsOpen(false)}>
                        <LogIn /> Login
                    </Link>
                ) : (
                    <button onClick={handleSignOut} className="flex items-center gap-2 mt-4">
                        <LogOut /> Logout
                    </button>
                )}
            </div>
        </div>
    );
}
