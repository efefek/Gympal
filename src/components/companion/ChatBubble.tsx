"use client"

import type { ChatMessage } from '@/lib/companion'

interface ChatBubbleProps {
  message: ChatMessage
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
        isUser ? 'bg-primary text-black' : 'bg-surface-2 text-zinc-400'
      }`}>
        {isUser ? 'U' : 'AI'}
      </div>

      <div
        className={`max-w-xs px-4 py-2 rounded-lg ${
          isUser
            ? 'bg-primary text-black rounded-br-none'
            : 'bg-surface-2 text-zinc-200 rounded-bl-none'
        }`}
      >
        <p className="text-sm leading-relaxed">{message.text}</p>
      </div>
    </div>
  )
}
