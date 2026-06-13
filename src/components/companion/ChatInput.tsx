"use client"

import { useState, useRef } from 'react'
import { Send } from 'lucide-react'

interface ChatInputProps {
  onSubmit: (message: string) => void
  isLoading?: boolean
}

export function ChatInput({ onSubmit, isLoading = false }: ChatInputProps) {
  const [input, setInput] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function handleSubmit() {
    const trimmed = input.trim()
    if (!trimmed || isLoading) return

    onSubmit(trimmed)
    setInput('')

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value)
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px'
    }
  }

  return (
    <div className="flex gap-2 items-end p-4 bg-surface-1 rounded-2xl border border-zinc-800">
      <textarea
        ref={textareaRef}
        value={input}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Ask me anything..."
        className="flex-1 bg-surface-2 text-zinc-100 placeholder-zinc-500 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary max-h-30"
        rows={1}
        disabled={isLoading}
      />
      <button
        onClick={handleSubmit}
        disabled={!input.trim() || isLoading}
        className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg bg-primary text-black hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Send message"
      >
        <Send size={18} />
      </button>
    </div>
  )
}
