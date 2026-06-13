'use client'

import { useState } from 'react'
import { mealStore, setMeal, mealCellId, MEAL_SLOTS, type MealEntry, type MealSlot } from '@/lib/tracker'
import { useMounted } from '@/lib/hooks'
import { t } from '@/lib/i18n'

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const SLOT_LABEL: Record<MealSlot, string> = {
  breakfast: t.dashboard.meals.breakfast,
  lunch: t.dashboard.meals.lunch,
  dinner: t.dashboard.meals.dinner,
  snack: t.dashboard.meals.snack,
}

export default function MealPlanner() {
  const mounted = useMounted()
  const [entries, setEntries] = useState<MealEntry[]>(() => mealStore.get())
  const [activeDay, setActiveDay] = useState(0)

  function valueFor(day: number, slot: MealSlot): string {
    return entries.find((e) => e.id === mealCellId(day, slot))?.text ?? ''
  }

  function handleChange(day: number, slot: MealSlot, text: string) {
    setEntries(setMeal(day, slot, text))
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-surface-1 p-4">
      <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{t.dashboard.meals.title}</span>

      {/* Day selector */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide -mx-1 px-1 mt-3 mb-3">
        {DAY_LABELS.map((label, i) => (
          <button
            key={label}
            type="button"
            aria-pressed={activeDay === i}
            onClick={() => setActiveDay(i)}
            className={`tap-scale shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              activeDay === i ? 'bg-primary text-black' : 'bg-surface-2 text-zinc-400'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Slots for the active day */}
      <div className="space-y-2">
        {MEAL_SLOTS.map((slot) => (
          <div key={slot}>
            <label htmlFor={`meal-${activeDay}-${slot}`} className="block text-[11px] font-medium text-zinc-500 mb-1">
              {SLOT_LABEL[slot]}
            </label>
            <input
              id={`meal-${activeDay}-${slot}`}
              type="text"
              placeholder={t.dashboard.meals.placeholder}
              value={mounted ? valueFor(activeDay, slot) : ''}
              onChange={(e) => handleChange(activeDay, slot, e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-foreground placeholder-zinc-600 outline-none focus:border-primary/50"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
