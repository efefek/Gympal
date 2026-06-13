'use client'

import { ProgressRing } from '@/components/ui/ProgressRing'
import { AnimatedNumber } from '@/components/ui/AnimatedNumber'
import type { HealthVital } from '@/lib/tracker'

const GOALS = {
  water: 2500,
  protein: 150,
  steps: 10000,
  heartRate: 80,
}

interface VitalsGridProps {
  vitals: HealthVital[]
}

export function VitalsGrid({ vitals }: VitalsGridProps) {
  const latest = vitals[vitals.length - 1]

  const cells = [
    {
      label: 'Water',
      value: latest?.waterMl ?? 0,
      goal: GOALS.water,
      display: latest ? (latest.waterMl ?? 0) / 1000 : 0,
      unit: 'L',
      decimals: 1,
    },
    {
      label: 'Protein',
      value: latest?.proteinG ?? 0,
      goal: GOALS.protein,
      display: latest?.proteinG ?? 0,
      unit: 'g',
      decimals: 0,
    },
    {
      label: 'Steps',
      value: latest?.steps ?? 0,
      goal: GOALS.steps,
      display: (latest?.steps ?? 0) / 1000,
      unit: 'K',
      decimals: 1,
    },
    {
      label: 'Heart Rate',
      value: latest?.heartRate ?? 0,
      goal: GOALS.heartRate,
      display: latest?.heartRate ?? 0,
      unit: 'bpm',
      decimals: 0,
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3">
      {cells.map(({ label, value, goal, display, unit, decimals }) => (
        <div
          key={label}
          className="rounded-2xl border p-3 flex items-center gap-3"
          style={{ background: 'var(--surface-1)', borderColor: 'var(--card-border)' }}
        >
          <ProgressRing value={value} max={goal} size={48} strokeWidth={4} />
          <div>
            <p className="text-xs mb-0.5" style={{ color: 'var(--muted)' }}>{label}</p>
            <p className="text-lg font-bold leading-none" style={{ color: value > 0 ? 'var(--foreground)' : 'var(--muted)' }}>
              {value > 0 ? <AnimatedNumber value={display} decimals={decimals} /> : '—'}
              <span className="text-xs font-normal ml-0.5" style={{ color: 'var(--muted)' }}>{unit}</span>
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
