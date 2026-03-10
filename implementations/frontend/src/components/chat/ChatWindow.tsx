'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Clock } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { useChat } from '@/hooks/useChat';
import { Spinner } from '@/components/ui/Spinner';

interface ChatWindowProps {
  sessionId: string;
  supportAvailable?: boolean;
}

export function ChatWindow({ sessionId, supportAvailable = false }: ChatWindowProps) {
  const [input, setInput] = useState('');
  const { messages, isLoading, isSending, sendMessage } = useChat(sessionId);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isSending) return;
    const content = input;
    setInput('');
    await sendMessage(content);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3 border-b border-gray-100 bg-gradient-to-r from-primary-50 to-accent-light flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">Support Chat</h3>
          <p className="text-xs text-gray-500">Automated responses available 24/7</p>
        </div>
        <div className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
          supportAvailable ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
        }`}>
          <div className={`w-1.5 h-1.5 rounded-full ${supportAvailable ? 'bg-green-500' : 'bg-gray-400'}`} />
          {supportAvailable ? 'Support online' : 'Bot only'}
        </div>
      </div>

      {!supportAvailable && (
        <div className="bg-yellow-50 border-b border-yellow-100 px-5 py-2 flex items-center gap-2 text-xs text-yellow-700">
          <Clock className="w-3.5 h-3.5" />
          Human support available Mon–Fri 9:00–17:00 Bangkok time
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">Start a conversation. Type &ldquo;help&rdquo; to see what I can assist with.</p>
          </div>
        ) : (
          messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-5 py-3 border-t border-gray-100 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder="Type a message..."
          disabled={isSending}
          className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
        />
        <button
          onClick={handleSend}
          disabled={isSending || !input.trim()}
          className="bg-primary hover:bg-primary-dark text-white p-2.5 rounded-xl disabled:opacity-50 transition-colors"
          aria-label="Send"
        >
          {isSending ? <Spinner size="sm" /> : <Send className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
