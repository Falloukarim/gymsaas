import { ReactNode } from 'react';
import Sidebar from '@/components/dashboard/sidebar';
import Navbar from '@/components/dashboard/navbar';
import { SidebarProvider } from '@/context/SidebarContext';

export default function GymLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-[#0d1a23] overflow-x-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col w-full max-w-[100vw]">
          <Navbar />
          <main className="flex-1 w-full overflow-x-hidden px-4 py-6">
            <div className="mx-auto w-full max-w-[calc(100vw-2rem)]">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}