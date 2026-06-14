'use client'

import { useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import type { BodyMeasurement, HealthVital } from '@/lib/tracker'

/* ─── Seri tanımları ────────────────────────────────────────── */

type SeriesKey = 'weight' | 'waist' | 'arm' | 'bodyFat' | 'water' | 'protein' | 'food' | 'steps'
type Range = '1W' | '1M' | '3M' | '1Y'

const SERIES: { key: SeriesKey; label: string; color: string; unit: string }[] = [
  { key: 'weight',  label: 'Weight',  color: 'var(--series-blue)',   unit: 'kg'   },
  { key: 'waist',   label: 'Waist',   color: 'var(--series-violet)', unit: 'cm'   },
  { key: 'arm',     label: 'Arm',     color: 'var(--series-green)',  unit: 'cm'   },
  { key: 'bodyFat', label: 'Body Fat',color: 'var(--series-amber)',  unit: '%'    },
  { key: 'water',   label: 'Water',   color: 'var(--series-blue)',   unit: 'L'    },
  { key: 'protein', label: 'Protein', color: 'var(--series-red)',    unit: 'g'    },
  { key: 'food',    label: 'Food',    color: 'var(--series-amber)',  unit: 'kcal' },
  { key: 'steps',   label: 'Steps',   color: 'var(--series-green)',  unit: 'K'    },
]

const RANGE_DAYS: Record<Range, number> = { '1W': 7, '1M': 30, '3M': 90, '1Y': 365 }

interface MultiTrendChartProps {
  measurements: BodyMeasurement[]
  vitals: HealthVital[]
}

/* Ölçüm verisinden seri değerini çek */
function measureVal(m: BodyMeasurement, key: SeriesKey): number | undefined {
  if (key === 'weight')  return m.weight
  if (key === 'waist')   return m.waistCirc
  if (key === 'arm')     return m.armCirc
  if (key === 'bodyFat') return m.bodyFat
  return undefined
}

/* Vital verisinden seri değerini çek (görüntüleme birimi) */
function vitalVal(v: HealthVital, key: SeriesKey): number | undefined {
  if (key === 'water')   return v.waterMl != null ? v.waterMl / 1000 : undefined
  if (key === 'protein') return v.proteinG
  if (key === 'food')    return v.foodKcal
  if (key === 'steps')   return v.steps != null ? v.steps / 1000 : undefined
  return undefined
}

function shortDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getDate()}/${d.getMonth() + 1}`
}

/* Bir seriyi 0-100'e normalize et */
function normalise(value: number, min: number, max: number): number {
  if (max === min) return 50
  return Math.round(((value - min) / (max - min)) * 100)
}

export function MultiTrendChart({ measurements, vitals }: MultiTrendChartProps) {
  const [selected, setSelected] = useState<Set<SeriesKey>>(new Set(['weight']))
  const [range, setRange] = useState<Range>('1M')

  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - RANGE_DAYS[range])

  /* Filtreli veriler */
  const filteredM = measurements.filter((m) => new Date(m.date) >= cutoff)
  const filteredV = vitals.filter((v) => new Date(v.date) >= cutoff)

  /* Tüm tarihlerin birleşimi */
  const allDates = Array.from(
    new Set([...filteredM.map((m) => m.date), ...filteredV.map((v) => v.date)])
  ).sort()

  /* Her seri için gerçek değer dizisi */
  const rawSeries: Record<SeriesKey, (number | undefined)[]> = {} as never
  for (const s of SERIES) {
    rawSeries[s.key] = allDates.map((date) => {
      const m = filteredM.find((x) => x.date === date)
      const v = filteredV.find((x) => x.date === date)
      if (m && measureVal(m, s.key) != null) return measureVal(m, s.key)
      if (v && vitalVal(v, s.key) != null) return vitalVal(v, s.key)
      return undefined
    })
  }

  /* Min-max hesapla (normalise için) */
  const ranges: Record<SeriesKey, { min: number; max: number }> = {} as never
  for (const s of SERIES) {
    const vals = rawSeries[s.key].filter((v): v is number => v != null)
    ranges[s.key] = vals.length > 0
      ? { min: Math.min(...vals), max: Math.max(...vals) }
      : { min: 0, max: 1 }
  }

  /* Chart data */
  const data = allDates.map((date, i) => {
    const row: Record<string, number | string> = { date: shortDate(date) }
    for (const key of selected) {
      const raw = rawSeries[key][i]
      if (raw != null) {
        row[key] = normalise(raw, ranges[key].min, ranges[key].max)
        row[`${key}_raw`] = raw
      }
    }
    return row
  })

  function toggleSeries(key: SeriesKey) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        if (next.size === 1) return prev
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  const selectedList = SERIES.filter((s) => selected.has(s.key))

  return (
    <div className="flex flex-col gap-4">
      {/* Range tabs */}
      <div className="flex gap-1">
        {(['1W', '1M', '3M', '1Y'] as Range[]).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRange(r)}
            className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${range === r ? 'btn-ink' : ''}`}
            style={range === r ? undefined : { background: 'var(--surface-2)', color: 'var(--muted)' }}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Series chips */}
      <div className="flex flex-wrap gap-2">
        {SERIES.map((s) => {
          const active = selected.has(s.key)
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => toggleSeries(s.key)}
              className="flex items-center gap-1.5 px-3 py-1 text-xs rounded-full border transition-colors"
              style={
                active
                  ? { background: s.color, borderColor: s.color, color: '#fff', opacity: 1 }
                  : { background: 'transparent', borderColor: 'var(--card-border)', color: 'var(--muted)' }
              }
            >
              {s.label}
            </button>
          )
        })}
      </div>

      {/* Chart */}
      {data.length === 0 ? (
        <p className="text-xs text-center py-6" style={{ color: 'var(--muted)' }}>
          No data — log measurements and vitals to see trends.
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'var(--muted)' }} axisLine={false} tickLine={false} />
            <YAxis hide domain={[0, 100]} />
            <Tooltip
              content={(props) => <CustomTooltip active={props.active} payload={props.payload as unknown as Array<{ dataKey: string; payload: Record<string, number> }> | undefined} label={props.label as string} selectedList={selectedList} />}
            />
            {selectedList.length > 1 && (
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 10, paddingTop: 8 }}
                formatter={(value) => {
                  const s = SERIES.find((x) => x.key === value)
                  return <span style={{ color: 'var(--foreground)' }}>{s?.label ?? value}</span>
                }}
              />
            )}
            {selectedList.map((s) => (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                stroke={s.color}
                strokeWidth={2}
                dot={{ r: 2, fill: s.color, strokeWidth: 0 }}
                activeDot={{ r: 4 }}
                connectNulls
                isAnimationActive
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

/* ─── Custom Tooltip ─────────────────────────────────────────── */

type TooltipEntry = { dataKey: string; payload: Record<string, number> }

function CustomTooltip({
  active,
  payload,
  label,
  selectedList,
}: {
  active?: boolean
  payload?: TooltipEntry[]
  label?: string
  selectedList: typeof SERIES
}) {
  if (!active || !payload?.length) return null
  return (
    <div
      className="rounded-lg px-3 py-2 text-xs"
      style={{ background: 'var(--surface-2)', border: '1px solid var(--card-border)' }}
    >
      <p className="mb-1 font-semibold">{label}</p>
      {payload.map((p) => {
        const key = p.dataKey
        const s = selectedList.find((x) => x.key === key)
        if (!s) return null
        const raw = p.payload[`${key}_raw`]
        return (
          <p key={key} style={{ color: s.color }}>
            {s.label}: {raw != null ? `${raw.toFixed(1)} ${s.unit}` : '—'}
          </p>
        )
      })}
    </div>
  )
}
