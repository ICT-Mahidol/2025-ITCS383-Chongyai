'use client';

import { ReactNode } from 'react';
import { useRequireAuth } from '@/hooks/useAuth';
import { Navbar } from '@/components/layout/Navbar';
import { Spinner } from '@/components/ui/Spinner';

export default function ChatLayout({ children }: { children: ReactNode }) {
  const { isLoading } = useRequireAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>;
  }

  return (
    <div>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-6">{children}</div>
    </div>
  );
}
