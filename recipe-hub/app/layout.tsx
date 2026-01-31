import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';
import { LogIn, User, UserCircle, Search, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import MobileNav from '@/components/MobileNav';

export const metadata: Metadata = {
  title: "Recipe Hub",
  description: "Create, share, and discover recipes",
};

export async function signOut() {
  "use server"
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect('/');
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex flex-col sm:flex sm:flex-col sm:flex sm:bg-gray-500 sm:pb-1 sm:flex-row ">
          
          {/* <header className="bg-gray-200 dark:text-gray-500 ">
            TODO: Search Bar
          </header> */}
          <nav className="relative z-50 flex flex-row sm:flex sm:flex-col sm:w-48 sm:p-4 sm:justify-between sm:bg-gray-100 sm:m-1 sm:rounded-lg sm:text-gray-700 ">

            {/* LOGO Top Left */}
            <div className="w-full flex flex-row items-center justify-between ml-[.25em] mr-[.5em] sm:m-0">
              <Link href="/" className="w-full p-2 text-2xl font-bold relative group">
                RecipeHub
                <span className="absolute bottom-0 left-0 w-0 h-1 bg-orange-500 group-hover:w-full transition-all duration-300"></span>
              </Link>

              <MobileNav user={user} signOut={signOut} className="m-2 sm:hidden"/>
            </div>
            

            <div className="hidden sm:flex flex-col gap-2">
              <div className="p-2 border rounded-lg hover:bg-gray-300 transition duration-300">
              <Link href="/recipes" className="flex gap-2"><Search />Browse</Link>
              
            </div>
              {user && (
                <div className="p-2 border rounded-lg hover:bg-gray-300 transition duration-300">
                  <Link href="/dashboard" className="flex gap-2">
                    <UserCircle size={20} /> Dashboard
                  </Link>
                </div>
              )}
            </div>
            <div className="hidden sm:flex flex-col p-2 ">
              {!user && (
              <a href="/login" className="relative group flex flex-row items-center gap-2">
                <LogIn size={20} />Login
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 group-hover:w-full transition-all duration-300"></span>
              </a>
              )}
              {user && (
                <div className="hidden sm:flex sm:w-full">
                  <form action={signOut} className="w-full">
                    <button type="submit" className="w-full">
                      <a className="relative group flex flex-row items-center gap-2">
                        <LogOut size={20} />Logout
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 group-hover:w-full transition-all duration-300"></span>
                      </a>
                    </button>
                  </form>
                </div>
              )}
              
            </div>
              
          </nav>

          <div className="relative z-0 flex flex-col flex-1 bg-gray-100 m-1 rounded-lg text-gray-700">
            <main className="flex-grow ">{children}</main>
            <footer className="flex h-8 justify-center bg-gray-200 items-center rounded-b-lg">
              <p>&copy; 2026 Recipe Hub</p>
            </footer>
          </div>
          

          
        </div>
        
        
      </body>
    </html>
  );
}
