'use client'

import { useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import type { BodyMeasurement } from '@/lib/tracker'

type Metric = 'weight' | 'waistCirc' | 'armCirc'
type Range = '1W' | '1M' | '3M' | '1Y'

const RANGE_DAYS: Record<Range, number> = { '1W': 7, '1M': 30, '3M': 90, '1Y': 365 }

const METRICS: { key: Metric; label: string }[] = [
  { key: 'weight', label: 'Weight' },
  { key: 'waistCirc', label: 'Waist' },
  { key: 'armCirc', label: 'Arm' },
]

interface MetricChartProps {
  measurements: BodyMeasurement[]
  range: Range
  onRangeChange: (r: Range) => void
}

function shortDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getDate()}/${d.getMonth() + 1}`
}

export function MetricChart({ measurements, range, onRangeChange }: MetricChartProps) {
  const [metric, setMetric] = useState<Metric>('weight')

  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - RANGE_DAYS[range])

  const data = measurements
    .filter((m) => new Date(m.date) >= cutoff && m[metric] != null)
    .map((m) => ({ date: shortDate(m.date), value: m[metric] as number }))

  return (
    <div className="rounded-2xl border p-4" style={{ background: 'var(--surface-1)', borderColor: 'var(--card-border)' }}>
      {/* Range tabs */}
      <div className="flex gap-1 mb-3">
        {(['1W', '1M', '3M', '1Y'] as Range[]).map((r) => (
          <button
            key={r}
            onClick={() => onRangeChange(r)}
            className={`px-3 py-1 text-xs rounded-lg transition-colors ${range === r ? 'btn-ink' : ''}`}
            style={range === r ? undefined : { background: 'var(--surface-2)', color: 'var(--muted)' }}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Metric chips */}
      <div className="flex gap-2 mb-4">
        {METRICS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setMetric(key)}
            className={`px-3 py-1 text-xs rounded-full border transition-colors ${metric === key ? 'btn-ink' : ''}`}
            style={metric === key ? { borderColor: 'transparent' } : { background: 'transparent', borderColor: 'var(--card-border)', color: 'var(--muted)' }}
          >
            {label}
          </button>
        ))}
      </div>

      {data.length === 0 ? (
        <p className="text-xs text-center py-6" style={{ color: 'var(--muted)' }}>No data yet — log measurements to see trends.</p>
      ) : (
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-3)" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--muted)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: 'var(--muted)' }} axisLine={false} tickLine={false} width={30} />
            <Tooltip
              contentStyle={{ background: 'var(--surface-2)', border: '1px solid var(--card-border)', borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: 'var(--foreground)' }}
              itemStyle={{ color: 'var(--foreground)' }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="var(--foreground)"
              strokeWidth={2}
              dot={{ r: 3, fill: 'var(--foreground)', strokeWidth: 0 }}
              activeDot={{ r: 5 }}
              isAnimationActive
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
