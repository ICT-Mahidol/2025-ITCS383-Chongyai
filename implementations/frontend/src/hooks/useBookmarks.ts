'use client';

import { useState, useEffect, useCallback } from 'react';
import api, { getApiErrorMessage } from '@/lib/api';
import type { Bookmark, PaginatedResponse, ApiResponse } from '@/types';

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get<PaginatedResponse<Bookmark>>('/bookmarks');
      setBookmarks(res.data.data);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const addBookmark = async (jobId: string): Promise<void> => {
    await api.post('/bookmarks', { jobId });
    await fetch();
  };

  const removeBookmark = async (jobId: string): Promise<void> => {
    await api.delete(`/bookmarks/${jobId}`);
    await fetch();
  };

  const isBookmarked = (jobId: string): boolean =>
    bookmarks.some((b) => b.jobId === jobId);

  return { bookmarks, isLoading, error, addBookmark, removeBookmark, isBookmarked, refetch: fetch };
}

export function useBookmarkCheck(jobId: string) {
  const [bookmarked, setBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const check = useCallback(async () => {
    if (!jobId) return;
    try {
      const res = await api.get<ApiResponse<{ bookmarked: boolean }>>(`/bookmarks/check/${jobId}`);
      setBookmarked(res.data.data.bookmarked);
    } catch {
      setBookmarked(false);
    } finally {
      setIsLoading(false);
    }
  }, [jobId]);

  useEffect(() => { check(); }, [check]);

  const toggle = async (): Promise<void> => {
    if (bookmarked) {
      await api.delete(`/bookmarks/${jobId}`);
    } else {
      await api.post('/bookmarks', { jobId });
    }
    await check();
  };

  return { bookmarked, isLoading, toggle };
}
