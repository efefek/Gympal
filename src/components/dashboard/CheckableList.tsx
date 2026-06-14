'use client'

import { useState } from 'react'
import { Plus, Check, Trash2 } from 'lucide-react'
import { generateId, type Store } from '@/lib/storage'
import { useMounted } from '@/lib/hooks'
import { t } from '@/lib/i18n'

interface ListItem {
  id: string
  text: string
  done: boolean
  createdAt: string
}

interface CheckableListProps<T extends ListItem> {
  title: string
  placeholder: string
  emptyText: string
  store: Store<T>
}

/** Shared add/check/remove list used by both the To-Do and Shopping modules. */
export default function CheckableList<T extends ListItem>({
  title,
  placeholder,
  emptyText,
  store,
}: CheckableListProps<T>) {
  const mounted = useMounted()
  const [items, setItems] = useState<T[]>(() => store.get())
  const [input, setInput] = useState('')

  function handleAdd() {
    if (!input.trim()) return
    const item = { id: generateId(), text: input.trim(), done: false, createdAt: new Date().toISOString() } as T
    setItems(store.add(item))
    setInput('')
  }

  function handleToggle(id: string, done: boolean) {
    setItems(store.update(id, { done: !done } as Partial<T>))
  }

  function handleRemove(id: string) {
    setItems(store.remove(id))
  }

  const sorted = mounted
    ? [...items].sort((a, b) => Number(a.done) - Number(b.done))
    : []

  const inputId = `list-input-${title.replace(/\s+/g, '-').toLowerCase()}`

  return (
    <div className="border-[3px] p-4" style={{ background: 'var(--surface-1)', borderColor: 'var(--foreground)' }}>
      <span className="font-mono text-xs font-bold uppercase tracking-[0.18em]" style={{ color: 'var(--muted)' }}>{title}</span>

      <ul className="space-y-1.5 mt-3">
        {sorted.map((item) => (
          <li key={item.id} className="flex items-center gap-3 group">
            <button
              type="button"
              aria-pressed={item.done}
              aria-label={`${item.text}${item.done ? ', done' : ''}`}
              onClick={() => handleToggle(item.id, item.done)}
              className={`tap-scale flex size-6 shrink-0 items-center justify-center rounded-md border transition-colors ${
                item.done ? 'btn-ink border-transparent' : 'border-zinc-700 text-transparent'
              }`}
            >
              <Check className="size-4" aria-hidden="true" />
            </button>
            <span className={`flex-1 text-sm ${item.done ? 'line-through' : ''}`} style={{ color: item.done ? 'var(--muted)' : 'var(--foreground)' }}>{item.text}</span>
            <button
              type="button"
              aria-label={`${t.common.delete} ${item.text}`}
              onClick={() => handleRemove(item.id)}
              className="flex size-7 items-center justify-center rounded-lg text-zinc-700 opacity-0 group-hover:opacity-100 transition-all hover:text-red-400"
            >
              <Trash2 className="size-3.5" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>

      {mounted && sorted.length === 0 && (
        <p className="mt-1 text-xs" style={{ color: 'var(--muted)' }}>{emptyText}</p>
      )}

      <div className="flex gap-2 mt-3">
        <label htmlFor={inputId} className="sr-only">{placeholder}</label>
        <input
          id={inputId}
          type="text"
          placeholder={placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          className="flex-1 border px-3 py-2 text-sm outline-none"
          style={{ background: 'var(--surface-2)', borderColor: 'var(--card-border)', color: 'var(--foreground)' }}
        />
        <button
          type="button"
          aria-label={t.common.add}
          onClick={handleAdd}
          className="btn-ink tap-scale flex size-9 items-center justify-center"
        >
          <Plus className="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
