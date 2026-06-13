'use client'
import { Flame, CalendarCheck, Scale } from 'lucide-react'
import { motion } from 'motion/react'
import { AnimatedNumber } from '@/components/ui/AnimatedNumber'
import {
  StreakSheet, WeightSheet, ActiveSheet,
  useStatSheet, type StatSheetKey,
} from '@/components/home/StatSheet'

interface StatsRowProps {
  currentWeightKg: number
  activeDays: number
  streak: number
  weightEntries: { date: string; kg: number }[]
}

const CARDS: {
  key: Exclude<StatSheetKey, null>
  icon: typeof Flame
  label: string
  unit: string
}[] = [
  { key: 'streak', icon: Flame,         label: 'Streak', unit: 'd'  },
  { key: 'active', icon: CalendarCheck, label: 'Active', unit: 'd'  },
  { key: 'weight', icon: Scale,         label: 'Weight', unit: 'kg' },
]

export function StatsRow({ currentWeightKg, activeDays, streak, weightEntries }: StatsRowProps) {
  const { open, setOpen, close } = useStatSheet()

  const values: Record<Exclude<StatSheetKey, null>, number> = {
    streak,
    active: activeDays,
    weight: currentWeightKg,
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-3">
        {CARDS.map(({ key, icon: Icon, label, unit }, i) => {
          const value = values[key]
          const empty = value === 0
          return (
            <motion.button
              key={key}
              type="button"
              onClick={() => setOpen(key)}
              whileTap={{ scale: 0.96 }}
              className="rounded-2xl border p-3.5 text-left cursor-pointer"
              style={{ background: 'var(--surface-1)', borderColor: 'var(--card-border)' }}
              aria-label={`${label} details`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-medium tabular" style={{ color: 'var(--muted)' }}>
                  0{i + 1}
                </span>
                <Icon className="size-4" style={{ color: 'var(--muted)' }} aria-hidden="true" />
              </div>
              <p className="text-2xl font-bold leading-none tracking-tight" style={{ color: empty ? 'var(--muted)' : 'var(--foreground)' }}>
                {empty ? '—' : <AnimatedNumber value={value} decimals={key === 'weight' ? 1 : 0} className="tabular" />}
                {!empty && <span className="text-xs font-normal ml-0.5" style={{ color: 'var(--muted)' }}>{unit}</span>}
              </p>
              <p className="text-xs mt-1.5" style={{ color: 'var(--muted)' }}>{label}</p>
            </motion.button>
          )
        })}
      </div>

      <StreakSheet open={open === 'streak'} onOpenChange={(v) => !v && close()} streak={streak} activeDays={activeDays} />
      <ActiveSheet open={open === 'active'} onOpenChange={(v) => !v && close()} activeDays={activeDays} streak={streak} />
      <WeightSheet open={open === 'weight'} onOpenChange={(v) => !v && close()} entries={weightEntries} />
    </>
  )
}
