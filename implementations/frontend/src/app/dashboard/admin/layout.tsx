'use client';

import { ReactNode } from 'react';
import { useRequireAuth } from '@/hooks/useAuth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Navbar } from '@/components/layout/Navbar';
import { Spinner } from '@/components/ui/Spinner';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, isLoading } = useRequireAuth('ADMIN');

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>;
  }

  if (!user) return null;

  return (
    <div>
      <Navbar />
      <DashboardLayout role="ADMIN">{children}</DashboardLayout>
    </div>
  );
}
