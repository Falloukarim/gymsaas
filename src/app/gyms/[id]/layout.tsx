// app/gyms/[id]/layout.tsx
import { ReactNode } from 'react';
import Sidebar from '@/components/dashboard/sidebar';
import Navbar from '@/components/dashboard/navbar';

export default function GymLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#0d1a23]">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}