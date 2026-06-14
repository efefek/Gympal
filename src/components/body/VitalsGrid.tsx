'use client'

import { ProgressRing } from '@/components/ui/ProgressRing'
import { AnimatedNumber } from '@/components/ui/AnimatedNumber'
import type { HealthVital } from '@/lib/tracker'

interface VitalsGridProps {
  vitals: HealthVital[]
  waterGoal?: number
  proteinGoal?: number
}

export function VitalsGrid({ vitals, waterGoal = 2500, proteinGoal = 150 }: VitalsGridProps) {
  const latest = vitals[vitals.length - 1]

  const cells = [
    {
      label: 'Water',
      value: latest?.waterMl ?? 0,
      goal: waterGoal,
      display: latest ? (latest.waterMl ?? 0) / 1000 : 0,
      unit: 'L',
      decimals: 1,
    },
    {
      label: 'Protein',
      value: latest?.proteinG ?? 0,
      goal: proteinGoal,
      display: latest?.proteinG ?? 0,
      unit: 'g',
      decimals: 0,
    },
    {
      label: 'Food',
      value: latest?.foodKcal ?? 0,
      goal: 2400,
      display: latest?.foodKcal ?? 0,
      unit: 'kcal',
      decimals: 0,
    },
    {
      label: 'Steps',
      value: latest?.steps ?? 0,
      goal: 10000,
      display: (latest?.steps ?? 0) / 1000,
      unit: 'K',
      decimals: 1,
    },
    {
      label: 'Heart Rate',
      value: latest?.heartRate ?? 0,
      goal: 80,
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
          className="flex items-center gap-3 border-[3px] p-3"
          style={{ background: 'var(--surface-1)', borderColor: 'var(--foreground)' }}
        >
          <ProgressRing value={value} max={goal} size={48} strokeWidth={4} />
          <div>
            <p className="text-xs mb-0.5" style={{ color: 'var(--muted)' }}>{label}</p>
            <p className="font-mono text-lg font-bold leading-none" style={{ color: value > 0 ? 'var(--foreground)' : 'var(--muted)' }}>
              {value > 0 ? <AnimatedNumber value={display} decimals={decimals} /> : '—'}
              <span className="text-xs font-normal ml-0.5" style={{ color: 'var(--muted)' }}>{unit}</span>
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
