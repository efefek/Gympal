'use client'

import { useState } from 'react'
import { Plus, TrendingDown, TrendingUp, Minus } from 'lucide-react'
import { logWeight, getWeightLog, type WeightEntry } from '@/lib/tracker'
import { getProfile, saveProfile } from '@/lib/profile'
import { useMounted } from '@/lib/hooks'
import { NumberScrubber } from '@/components/ui/NumberScrubber'
import { t } from '@/lib/i18n'

const MAX_POINTS = 30
const DEFAULT_WEIGHT = 75

/** Tarih bazlı sparkline — noktalar gün farkına göre yatayda konumlanır,
 *  böylece günler arası boşluk grafikte görünür. Son nokta vurgulanır. */
function Sparkline({ entries }: { entries: WeightEntry[] }) {
  if (entries.length < 2) return null
  const kgs = entries.map((e) => e.kg)
  const min = Math.min(...kgs)
  const max = Math.max(...kgs)
  const range = max - min || 1

  const times = entries.map((e) => new Date(e.date).getTime())
  const tMin = times[0]
  const tMax = times[times.length - 1]
  const tRange = tMax - tMin || 1

  const W = 280
  const H = 60
  const points = entries.map((e, i) => {
    const x = ((times[i] - tMin) / tRange) * W
    const y = H - ((e.kg - min) / range) * (H - 8) - 4
    return { x, y }
  })
  const last = points[points.length - 1]

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 h-16 w-full" preserveAspectRatio="none" aria-hidden="true">
      <polyline
        points={points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')}
        fill="none"
        stroke="var(--foreground)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <circle cx={last.x} cy={last.y} r="3.5" fill="var(--accent)" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

interface WeightChartProps {
  onLogged?: (kg: number) => void
}

export default function WeightChart({ onLogged }: WeightChartProps) {
  const mounted = useMounted()
  const [entries, setEntries] = useState<WeightEntry[]>(() => getWeightLog().slice(-MAX_POINTS))
  const latest = entries.length > 0 ? entries[entries.length - 1].kg : null
  const [draft, setDraft] = useState<number>(() => latest ?? DEFAULT_WEIGHT)

  function handleAdd() {
    if (!draft || draft < 30 || draft > 300) return
    const next = logWeight(draft)
    setEntries(next.slice(-MAX_POINTS))
    const profile = getProfile()
    if (profile) saveProfile({ ...profile, weight: draft })
    onLogged?.(draft)
  }

  const prev = entries.length > 1 ? entries[entries.length - 2].kg : null
  const delta = latest != null && prev != null ? Number((latest - prev).toFixed(1)) : null
  const DeltaIcon = delta == null || delta === 0 ? Minus : delta > 0 ? TrendingUp : TrendingDown

  return (
    <div className="surface-region p-4">
      <div className="flex items-start justify-between">
        <span className="font-mono text-xs font-bold uppercase tracking-[0.18em]" style={{ color: 'var(--muted)' }}>
          {t.dashboard.weight.title}
        </span>
        {mounted && latest !== null && (
          <div className="flex flex-col items-end">
            <span className="font-mono text-2xl font-black leading-none tabular-nums">
              {latest}
              <span className="ml-1 text-xs font-semibold" style={{ color: 'var(--muted)' }}>{t.dashboard.weight.kg}</span>
            </span>
            {delta != null && (
              <span
                className="mt-1 flex items-center gap-1 font-mono text-[11px] font-bold tabular-nums"
                style={{ color: delta === 0 ? 'var(--muted)' : 'var(--accent)' }}
              >
                <DeltaIcon className="size-3" aria-hidden="true" />
                {delta > 0 ? '+' : ''}{delta} {t.dashboard.weight.kg}
              </span>
            )}
          </div>
        )}
      </div>

      {mounted && entries.length >= 2 ? (
        <Sparkline entries={entries} />
      ) : (
        <p className="mt-3 text-xs" style={{ color: 'var(--muted)' }}>{t.dashboard.weight.empty}</p>
      )}

      <div className="mt-3 flex items-end gap-2">
        <NumberScrubber
          id="weight-input"
          label={`${t.dashboard.weight.logWeight} (${t.dashboard.weight.kg})`}
          value={draft}
          min={30}
          max={300}
          step={0.1}
          decimals={1}
          suffix={t.dashboard.weight.kg}
          onChange={setDraft}
        />
        <button
          type="button"
          aria-label={t.dashboard.weight.logWeight}
          onClick={handleAdd}
          className="btn-ink tap-scale flex h-12 shrink-0 items-center justify-center px-4"
          style={{ borderRadius: 'var(--r-field)' }}
        >
          <Plus className="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
