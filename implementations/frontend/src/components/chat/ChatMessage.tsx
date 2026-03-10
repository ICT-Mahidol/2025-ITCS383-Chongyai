import { Bot, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Message } from '@/types';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isBot = message.isBot;

  return (
    <div className={`flex gap-3 ${isBot ? 'justify-start' : 'justify-end'}`}>
      {isBot && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0 mt-1">
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}
      <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${isBot ? '' : 'order-first'}`}>
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
            isBot
              ? 'bg-white border border-gray-100 text-gray-700 shadow-sm rounded-tl-sm'
              : 'bg-primary text-white shadow-sm rounded-tr-sm'
          }`}
        >
          {message.content}
        </div>
        <p className={`text-xs text-gray-400 mt-1 ${isBot ? 'text-left' : 'text-right'}`}>
          {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
        </p>
      </div>
      {!isBot && (
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mt-1">
          <User className="w-4 h-4 text-gray-600" />
        </div>
      )}
    </div>
  );
}
