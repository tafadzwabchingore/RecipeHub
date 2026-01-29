import type { Metadata } from 'next';
import './globals.css';
import { LogIn, User, UserCircle, Search, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { updateRecipe } from '@/lib/recipes';
import { deleteRecipe } from '@/lib/recipes'

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
        <div className="flex min-h-screen bg-gray-500 pb-1">
          {/* <header className="bg-gray-200 dark:text-gray-500 ">
            TODO: Search Bar
          </header> */}
          <nav className="flex flex-col w-48 p-4 justify-between bg-gray-100 m-1 rounded-lg text-gray-700">
            <a href="/" className="p-2 text-2xl font-bold relative group">
            RecipeHub
            <span className="absolute bottom-0 left-0 w-0 h-1 bg-orange-500 group-hover:w-full transition-all duration-300"></span>
            </a>
            <div className="flex flex-col gap-2">
              <div className="p-2 border rounded-lg hover:bg-gray-300 transition duration-300">
              <a href="/recipes" className="flex gap-2"><Search />Browse</a>
              
            </div>
              {user && (
                <div className="p-2 border rounded-lg hover:bg-gray-300 transition duration-300">
                  <a href="/dashboard" className="flex gap-2">
                    <UserCircle size={20} /> Dashboard
                  </a>
                </div>
              )}
            </div>
            <div className="p-2 ">
              {!user && (
              <a href="/login" className="relative group flex flex-row items-center gap-2">
                <LogIn size={20} />Login
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 group-hover:w-full transition-all duration-300"></span>
              </a>
              )}
              {user && (
                <>
                  <form action={signOut}>
                    <button type="submit" className="w-full">
                      <a className="relative group flex flex-row items-center gap-2">
                        <LogOut size={20} />Logout
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 group-hover:w-full transition-all duration-300"></span>
                      </a>
                    </button>
                  </form>
                </>
              )}
              
            </div>
              
          </nav>

          <div className="flex flex-col flex-1 bg-gray-100 m-1 rounded-lg text-gray-700">
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
