import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import type { Role } from '@/types';

interface DashboardLayoutProps {
  role: Role;
  children: ReactNode;
}

export function DashboardLayout({ role, children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role={role} />
      <main className="flex-1 overflow-auto">
        <div className="p-6 max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
