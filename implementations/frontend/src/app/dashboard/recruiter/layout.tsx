'use client';

import { ReactNode } from 'react';
import { useRequireAuth } from '@/hooks/useAuth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Navbar } from '@/components/layout/Navbar';
import { Spinner } from '@/components/ui/Spinner';

export default function RecruiterLayout({ children }: { children: ReactNode }) {
  const { user, isLoading } = useRequireAuth('RECRUITER');

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>;
  }

  if (!user) return null;

  return (
    <div>
      <Navbar />
      <DashboardLayout role="RECRUITER">{children}</DashboardLayout>
    </div>
  );
}
