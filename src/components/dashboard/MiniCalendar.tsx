'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  moodStore, checklistStore, checklistCompletion, todayKey,
} from '@/lib/tracker'
import { useMounted } from '@/lib/hooks'
import { t } from '@/lib/i18n'

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

interface DayMarks {
  mood: boolean
  checklist: boolean
}

export default function MiniCalendar() {
  const mounted = useMounted()
  const [cursor, setCursor] = useState(() => {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() }
  })

  const firstOfMonth = new Date(cursor.year, cursor.month, 1)
  const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate()
  // JS getDay: Sun=0 → shift so Monday is the first column.
  const leadingBlanks = (firstOfMonth.getDay() + 6) % 7
  const monthLabel = firstOfMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
  const today = todayKey()

  function marksFor(day: number): DayMarks {
    const key = `${cursor.year}-${String(cursor.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const mood = moodStore.get().some((m) => m.date === key)
    const checklist = checklistCompletion(checklistStore.get(), key) === 100 &&
      checklistStore.get().length > 0
    return { mood, checklist }
  }

  function shift(delta: number) {
    setCursor((c) => {
      const m = c.month + delta
      return { year: c.year + Math.floor(m / 12), month: ((m % 12) + 12) % 12 }
    })
  }

  return (
    <div className="border-[3px] p-4" style={{ background: 'var(--surface-1)', borderColor: 'var(--foreground)' }}>
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono text-xs font-bold uppercase tracking-[0.18em]" style={{ color: 'var(--muted)' }}>{t.dashboard.calendar.title}</span>
        <div className="flex items-center gap-2">
          <button type="button" aria-label="Previous month" onClick={() => shift(-1)} style={{ color: 'var(--muted)' }}>
            <ChevronLeft className="size-4" aria-hidden="true" />
          </button>
          <span className="min-w-[88px] text-center font-mono text-xs font-bold" style={{ color: 'var(--foreground)' }}>{monthLabel}</span>
          <button type="button" aria-label="Next month" onClick={() => shift(1)} style={{ color: 'var(--muted)' }}>
            <ChevronRight className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS.map((d, i) => (
          <div key={i} className="text-center font-mono text-[10px] font-bold" style={{ color: 'var(--muted)' }}>{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: leadingBlanks }).map((_, i) => <div key={`blank-${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1
          const key = `${cursor.year}-${String(cursor.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const isToday = key === today
          const marks = mounted ? marksFor(day) : { mood: false, checklist: false }
          return (
            <div
              key={day}
              className={`flex flex-col items-center justify-center aspect-square rounded-lg text-xs ${
                isToday ? 'btn-ink font-bold' : ''
              }`}
              style={{ color: isToday ? undefined : 'var(--muted)' }}
            >
              <span>{day}</span>
              <div className="flex gap-0.5 mt-0.5 h-1">
                {marks.mood && <span className="size-1 rounded-full" style={{ background: 'var(--foreground)' }} aria-hidden="true" />}
                {marks.checklist && <span className="size-1 rounded-full" style={{ background: 'var(--accent)' }} aria-hidden="true" />}
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center gap-3 text-[10px]" style={{ color: 'var(--muted)' }}>
        <span className="flex items-center gap-1"><span className="size-1.5 rounded-full" style={{ background: 'var(--foreground)' }} />{t.dashboard.calendar.legendMood}</span>
        <span className="flex items-center gap-1"><span className="size-1.5 rounded-full" style={{ background: 'var(--accent)' }} />{t.dashboard.calendar.legendChecklist}</span>
      </div>
    </div>
  )
}
