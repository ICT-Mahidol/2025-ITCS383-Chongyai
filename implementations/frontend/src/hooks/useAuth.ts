'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth as useAuthContext } from '@/context/AuthContext';
import type { Role } from '@/types';

export { useAuth } from '@/context/AuthContext';

export function useRequireAuth(requiredRole?: Role) {
  const { user, isLoading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace('/auth/login');
      return;
    }
    if (requiredRole && user.role !== requiredRole) {
      router.replace('/dashboard/applicant');
    }
  }, [user, isLoading, requiredRole, router]);

  return { user, isLoading };
}
