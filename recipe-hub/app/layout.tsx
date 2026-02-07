import type { Metadata } from 'next';
import './globals.css';
import MobileNav from '@/components/MobileNav';
import DesktopNav from '@/components/DesktopNav';

export const metadata: Metadata = {
  title: "Recipe Hub",
  description: "Create, share, and discover recipes",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="h-screen overflow-x-hidden overflow-y-hidden">
        <div className="h-full flex flex-col sm:flex sm:flex-col sm:flex sm:bg-gray-500 sm:flex-row p-1">

          <nav className="relative z-50 flex flex-row sm:flex sm:flex-col sm:w-48 sm:p-4 sm:justify-between sm:bg-gray-100 sm:m-1 sm:rounded-lg sm:text-gray-700 ">

            {/* LOGO Top Left */}
            <div className="flex flex-col h-full w-full">

              <DesktopNav className="hidden sm:flex sm:flex-col sm:justify-between sm:h-full" />

              <MobileNav className="flex flex-row m-2 sm:hidden"/>
            </div>

          </nav>

          <div className="z-0 flex flex-col flex-1 bg-gray-100 m-1 rounded-lg text-gray-700">
            <main className="flex-grow overflow-y-auto">{children}</main>
            <footer className="flex h-8 justify-center bg-gray-200 items-center rounded-b-lg">
              <p>&copy; 2026 Recipe Hub</p>
            </footer>
          </div>

        </div>
      </body>
    </html>
  );
}
