import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: "Recipe Hub",
  description: "Create, share, and discover recipes",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="flex flex-col min-h-screen">
          <header className="bg-gray-200">
          <nav className="flex flex-row p-4 justify-between">
            <a href="/" className="">RecipeHub</a>
            <div>
              <a href="/recipes" >Browse</a>
            </div>
            <div className="flex flex-row gap-4 ">
              <a href="/login" >Login</a>
            </div>
            
          </nav>
        </header>

        <main className="flex-grow ">{children}</main>

        <footer className="flex h-8 justify-center bg-gray-200 items-center">
          <p>&copy; 2026 Recipe Hub</p>
        </footer>
        </div>
        
      </body>
    </html>
  );
}
