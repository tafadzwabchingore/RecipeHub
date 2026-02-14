import MobileNav from '@/components/MobileNav';
import DesktopNav from '@/components/DesktopNav';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen flex flex-col sm:flex-row sm:bg-gray-500 sm:pb-1 overflow-hidden">
      <nav className="relative z-50 flex flex-row shrink-0 sm:flex sm:flex-col sm:w-48 sm:p-4 sm:justify-between sm:bg-gray-100 sm:m-1 sm:rounded-lg sm:text-gray-700">
        <div className="flex flex-col h-full w-full">
          <DesktopNav className="hidden sm:flex sm:flex-col sm:justify-between sm:h-full" />
          <MobileNav className="flex flex-row m-2 sm:hidden" />
        </div>
      </nav>
      <div className="relative z-0 flex flex-col flex-1 min-h-0 bg-gray-100 m-1 rounded-lg text-gray-700">
        <main className="flex-grow overflow-y-auto">{children}</main>
        <footer className="flex h-8 shrink-0 justify-center bg-gray-200 items-center rounded-b-lg">
          <p>&copy; 2026 Recipe Hub</p>
        </footer>
      </div>
    </div>
  );
}
