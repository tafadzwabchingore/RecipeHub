import { LogIn, Search, LogOut } from 'lucide-react';
import { getServerUser } from '@/lib/supabase/server';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';
import DashboardMenu from './DashboardMenu';
import DeleteAccountButton from './DeleteAccountButton';

interface DesktopNavProps {
    className?: string;
}

export default async function DesktopNav({ className }: DesktopNavProps) {
    const user = await getServerUser();

    async function signOut() {
        'use server';
        const supabase = await createClient();
        await supabase.auth.signOut();
        revalidatePath('/', 'layout');
        redirect('/');
    }

    return (
        <div className={className}>
            <div className="flex flex-col justify-between h-full">
                <Link href="/" className="p-2 text-2xl font-bold relative group">
                    RecipeHub
                    <span className="absolute bottom-0 left-0 w-0 h-1 bg-orange-500 group-hover:w-full transition-all duration-300"></span>
                </Link>
                <div className="flex flex-col gap-2">
                    <div className="p-2 border rounded-lg hover:bg-gray-300 transition duration-300">
                        <Link href="/recipes" className="flex gap-2"><Search />Browse</Link>
                    </div>
                    {user && (
                        <DashboardMenu />
                    )}
                </div>
                <div className="flex flex-col p-2">
                    {!user && (
                        <a href="/login" className="relative group flex flex-row items-center gap-2">
                            <LogIn size={20} />Login
                            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 group-hover:w-full transition-all duration-300"></span>
                        </a>
                    )}
                    {user && (
                        <div className="flex flex-col gap-3">
                            <form action={signOut}>
                                <button type="submit" className="w-full">
                                    <span className="relative group flex flex-row items-center gap-2">
                                        <LogOut size={20} />Logout
                                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 group-hover:w-full transition-all duration-300"></span>
                                    </span>
                                </button>
                            </form>
                            <DeleteAccountButton />
                        </div>
                    )}
                </div>
            </div>
            
        </div>
    );
}
