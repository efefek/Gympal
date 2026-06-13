'use client'

import { useState } from 'react'
import { Plus, Check, Trash2 } from 'lucide-react'
import {
  checklistStore, addChecklistItem, toggleChecklistDone,
  checklistCompletion, todayKey, type ChecklistItem,
} from '@/lib/tracker'
import { useMounted } from '@/lib/hooks'
import { t } from '@/lib/i18n'

export default function DailyChecklist() {
  const mounted = useMounted()
  const today = todayKey()
  const [items, setItems] = useState<ChecklistItem[]>(() => checklistStore.get())
  const [input, setInput] = useState('')

  function handleAdd() {
    if (!input.trim()) return
    setItems(addChecklistItem(input.trim()))
    setInput('')
  }

  function handleToggle(id: string) {
    setItems(toggleChecklistDone(id, today))
  }

  function handleRemove(id: string) {
    setItems(checklistStore.remove(id))
  }

  const completion = mounted ? checklistCompletion(items, today) : 0

  return (
    <div className="rounded-2xl border border-zinc-800 bg-surface-1 p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{t.dashboard.checklist.title}</span>
        {mounted && items.length > 0 && (
          <span className="text-xs font-bold text-primary tabular-nums">{completion}%</span>
        )}
      </div>

      {mounted && items.length > 0 && (
        <div className="h-1.5 rounded-full bg-surface-3 overflow-hidden mb-3">
          <div className="h-full bg-primary transition-all" style={{ width: `${completion}%` }} />
        </div>
      )}

      <ul className="space-y-1.5">
        {mounted && items.map((item) => {
          const done = item.doneDates.includes(today)
          return (
            <li key={item.id} className="flex items-center gap-3 group">
              <button
                type="button"
                aria-pressed={done}
                aria-label={`${item.label}${done ? ', done' : ''}`}
                onClick={() => handleToggle(item.id)}
                className={`tap-scale flex size-6 shrink-0 items-center justify-center rounded-md border transition-colors ${
                  done ? 'bg-primary border-primary text-black' : 'border-zinc-700 text-transparent'
                }`}
              >
                <Check className="size-4" aria-hidden="true" />
              </button>
              <span className={`flex-1 text-sm ${done ? 'text-zinc-600 line-through' : 'text-zinc-300'}`}>{item.label}</span>
              <button
                type="button"
                aria-label={`Remove ${item.label}`}
                onClick={() => handleRemove(item.id)}
                className="flex size-7 items-center justify-center rounded-lg text-zinc-700 opacity-0 group-hover:opacity-100 transition-all hover:text-red-400"
              >
                <Trash2 className="size-3.5" aria-hidden="true" />
              </button>
            </li>
          )
        })}
      </ul>

      {mounted && items.length === 0 && (
        <p className="text-xs text-zinc-600 mb-2">{t.dashboard.checklist.empty}</p>
      )}

      <div className="flex gap-2 mt-3">
        <label htmlFor="checklist-input" className="sr-only">{t.dashboard.checklist.placeholder}</label>
        <input
          id="checklist-input"
          type="text"
          placeholder={t.dashboard.checklist.placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-foreground placeholder-zinc-600 outline-none focus:border-primary/50"
        />
        <button
          type="button"
          aria-label={t.common.add}
          onClick={handleAdd}
          className="tap-scale flex size-9 items-center justify-center rounded-xl bg-primary text-black"
        >
          <Plus className="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
