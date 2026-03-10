'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import api, { getApiErrorMessage } from '@/lib/api';
import type { Message, ApiResponse } from '@/types';

interface SendMessageResponse {
  userMessage: Message;
  botMessage: Message;
}

export function useChat(sessionId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!sessionId) return;
    try {
      const res = await api.get<ApiResponse<Message[]>>(`/chat/history/${sessionId}`);
      setMessages(res.data.data);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchHistory();
    pollingRef.current = setInterval(fetchHistory, 5000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [fetchHistory]);

  const sendMessage = useCallback(async (content: string): Promise<void> => {
    if (!content.trim()) return;
    setIsSending(true);
    setError(null);
    try {
      const res = await api.post<ApiResponse<SendMessageResponse>>('/chat/message', {
        content,
        sessionId,
      });
      const { userMessage, botMessage } = res.data.data;
      setMessages((prev) => [...prev, userMessage, botMessage]);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsSending(false);
    }
  }, [sessionId]);

  return { messages, isLoading, isSending, error, sendMessage };
}
