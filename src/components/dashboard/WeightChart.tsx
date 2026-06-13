'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { logWeight, getWeightLog, type WeightEntry } from '@/lib/tracker'
import { getProfile, saveProfile } from '@/lib/profile'
import { useMounted } from '@/lib/hooks'
import { t } from '@/lib/i18n'

const MAX_POINTS = 30

function Sparkline({ entries }: { entries: WeightEntry[] }) {
  if (entries.length < 2) return null
  const kgs = entries.map((e) => e.kg)
  const min = Math.min(...kgs)
  const max = Math.max(...kgs)
  const range = max - min || 1
  const W = 280
  const H = 64
  const step = W / (entries.length - 1)
  const points = entries.map((e, i) => {
    const x = i * step
    const y = H - ((e.kg - min) / range) * (H - 8) - 4
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-16 mt-3" preserveAspectRatio="none" aria-hidden="true">
      <polyline
        points={points.join(' ')}
        fill="none"
        stroke="var(--primary)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

export default function WeightChart() {
  const mounted = useMounted()
  const [entries, setEntries] = useState<WeightEntry[]>(() => getWeightLog().slice(-MAX_POINTS))
  const [input, setInput] = useState('')

  function handleAdd() {
    const kg = Number(input)
    if (!kg || kg < 30 || kg > 300) return
    const next = logWeight(kg)
    setEntries(next.slice(-MAX_POINTS))
    setInput('')
    const profile = getProfile()
    if (profile) saveProfile({ ...profile, weight: kg })
  }

  const latest = entries.length > 0 ? entries[entries.length - 1].kg : null

  return (
    <div className="rounded-2xl border border-zinc-800 bg-surface-1 p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{t.dashboard.weight.title}</span>
        {mounted && latest !== null && (
          <span className="text-sm font-bold text-foreground tabular-nums">{latest} {t.dashboard.weight.kg}</span>
        )}
      </div>

      {mounted && entries.length >= 2 ? (
        <Sparkline entries={entries} />
      ) : (
        <p className="text-xs text-zinc-600 mt-3">{t.dashboard.weight.empty}</p>
      )}

      <div className="flex gap-2 mt-3">
        <label htmlFor="weight-input" className="sr-only">{t.dashboard.weight.logWeight}</label>
        <input
          id="weight-input"
          type="number"
          inputMode="decimal"
          placeholder={`${t.dashboard.weight.logWeight} (${t.dashboard.weight.kg})`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-foreground placeholder-zinc-600 outline-none focus:border-primary/50"
        />
        <button
          type="button"
          aria-label={t.dashboard.weight.logWeight}
          onClick={handleAdd}
          className="tap-scale flex size-9 items-center justify-center rounded-xl bg-primary text-black"
        >
          <Plus className="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
