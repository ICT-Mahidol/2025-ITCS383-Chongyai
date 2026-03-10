'use client';

import { useState, useEffect, useCallback } from 'react';
import api, { getApiErrorMessage } from '@/lib/api';
import type { Application, PaginatedResponse, ApiResponse, ApplicationStatus } from '@/types';

export function useMyApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const res = await api.get<PaginatedResponse<Application>>(`/applications/mine?page=${page}`);
      setApplications(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const apply = async (jobId: string, coverLetter?: string): Promise<Application> => {
    const res = await api.post<ApiResponse<Application>>('/applications', { jobId, coverLetter });
    await fetch();
    return res.data.data;
  };

  const withdraw = async (id: string): Promise<void> => {
    await api.delete(`/applications/${id}`);
    await fetch();
  };

  return { applications, pagination, isLoading, error, apply, withdraw, refetch: fetch };
}

export function useJobApplications(jobId: string) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!jobId) return;
    setIsLoading(true);
    try {
      const res = await api.get<PaginatedResponse<Application>>(`/applications/job/${jobId}`);
      setApplications(res.data.data);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [jobId]);

  useEffect(() => { fetch(); }, [fetch]);

  const updateStatus = async (id: string, status: ApplicationStatus): Promise<void> => {
    await api.put(`/applications/${id}/status`, { status });
    await fetch();
  };

  return { applications, isLoading, error, updateStatus, refetch: fetch };
}
