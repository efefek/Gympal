'use client'

import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { useMounted } from '@/lib/hooks'
import { getMockResponse, addMessage, type ChatMessage } from '@/lib/companion'
import { ChatBubble } from '@/components/companion/ChatBubble'
import { QuickSuggestions } from '@/components/companion/QuickSuggestions'
import { ChatInput } from '@/components/companion/ChatInput'

export default function CompanionPage() {
  const mounted = useMounted()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)

  function handleSendMessage(userInput: string) {
    const userMsg = addMessage(userInput, 'user')
    setMessages((prev) => [...prev, userMsg])

    setIsLoading(true)
    setTimeout(() => {
      const responseText = getMockResponse(userInput)
      const aiMsg = addMessage(responseText, 'ai')
      setMessages((prev) => [...prev, aiMsg])
      setIsLoading(false)
    }, 500)
  }

  function handleQuickSuggestion(suggestion: string) {
    handleSendMessage(suggestion)
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="flex flex-col h-screen bg-surface-1">
      <div className="sticky top-0 z-10 border-b border-zinc-800 bg-surface-1 px-4 py-4">
        <div className="flex items-center gap-2">
          <Sparkles size={20} className="text-primary" />
          <h1 className="text-lg font-semibold text-zinc-100">AI Companion</h1>
        </div>
        <p className="text-xs text-zinc-500 mt-1">Get personalized fitness advice and guidance</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-surface-2 flex items-center justify-center">
              <Sparkles size={24} className="text-primary" />
            </div>
            <div>
              <p className="text-zinc-200 font-medium">Welcome to your AI Companion</p>
              <p className="text-xs text-zinc-500 mt-1">
                Ask me about your workout program, goals, exercises, or fitness tips
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg) => <ChatBubble key={msg.id} message={msg} />)
        )}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-semibold text-zinc-400">AI</span>
            </div>
            <div className="bg-surface-2 text-zinc-400 px-4 py-2 rounded-lg rounded-bl-none">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {messages.length < 3 && (
        <div className="px-4 py-2 border-t border-zinc-800">
          <p className="text-xs text-zinc-500 mb-2">Quick suggestions:</p>
          <QuickSuggestions onSelect={handleQuickSuggestion} />
        </div>
      )}

      <div className="border-t border-zinc-800 bg-surface-1 p-4">
        <ChatInput onSubmit={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>
  )
}
