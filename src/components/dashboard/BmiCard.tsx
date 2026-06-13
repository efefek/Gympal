'use client'

import { calcBMI, bmiCategory } from '@/lib/profile'
import { t } from '@/lib/i18n'

const CATEGORY_LABEL: Record<string, string> = {
  underweight: t.dashboard.bmi.underweight,
  normal: t.dashboard.bmi.normal,
  overweight: t.dashboard.bmi.overweight,
  obese: t.dashboard.bmi.obese,
}

const CATEGORY_COLOR: Record<string, string> = {
  underweight: '#38bdf8',
  normal: 'var(--primary)',
  overweight: '#facc15',
  obese: '#f87171',
}

// BMI gauge spans 15–40 across a 180° arc.
const BMI_MIN = 15
const BMI_MAX = 40
const RADIUS = 70
const CIRC = Math.PI * RADIUS // half circle

interface BmiCardProps {
  height: number
  weight: number
}

export default function BmiCard({ height, weight }: BmiCardProps) {
  const bmi = calcBMI(height, weight)
  const category = bmiCategory(bmi)
  const color = CATEGORY_COLOR[category] ?? 'var(--primary)'

  const clamped = Math.max(BMI_MIN, Math.min(BMI_MAX, bmi))
  const ratio = (clamped - BMI_MIN) / (BMI_MAX - BMI_MIN)
  const dashOffset = CIRC * (1 - ratio)

  return (
    <div className="rounded-2xl border border-zinc-800 bg-surface-1 p-4">
      <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{t.dashboard.bmi.title}</span>

      <div className="flex flex-col items-center mt-2">
        <div className="relative" style={{ width: 160, height: 88 }}>
          <svg width="160" height="88" viewBox="0 0 160 88" aria-hidden="true">
            <path
              d={`M 10 80 A ${RADIUS} ${RADIUS} 0 0 1 150 80`}
              fill="none"
              stroke="#27272a"
              strokeWidth="10"
              strokeLinecap="round"
            />
            <path
              d={`M 10 80 A ${RADIUS} ${RADIUS} 0 0 1 150 80`}
              fill="none"
              stroke={color}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={CIRC}
              strokeDashoffset={dashOffset}
            />
          </svg>
          <div className="absolute inset-x-0 bottom-0 flex flex-col items-center">
            <span className="text-2xl font-black tabular-nums" style={{ color }}>{bmi.toFixed(1)}</span>
          </div>
        </div>
        <span className="text-xs font-medium mt-1" style={{ color }}>{CATEGORY_LABEL[category] ?? category}</span>
      </div>
    </div>
  )
}
