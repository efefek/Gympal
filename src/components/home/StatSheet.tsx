'use client'
import { useState } from 'react'
import { XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { Sheet } from '@/components/ui/Sheet'

/* ─── Streak Sheet ────────────────────────────────────────── */

interface StreakSheetProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  streak: number
  activeDays: number
}

export function StreakSheet({ open, onOpenChange, streak, activeDays }: StreakSheetProps) {
  const now = new Date()
  const dayOfWeek = now.getDay() === 0 ? 7 : now.getDay()

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="Streak">
      <div className="mb-5">
        <p className="text-6xl font-bold tabular tracking-tight" style={{ color: 'var(--foreground)' }}>
          {streak}<span className="text-2xl font-normal" style={{ color: 'var(--muted)' }}> days</span>
        </p>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
          {streak > 0 ? 'Consecutive active days. Keep it going.' : 'Log a workout or measurement today to start.'}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Stat label="This week" value={`${Math.min(activeDays, dayOfWeek)}/${dayOfWeek}`} />
        <Stat label="Active total" value={`${activeDays}d`} />
      </div>
    </Sheet>
  )
}

/* ─── Weight Sheet ────────────────────────────────────────── */

interface WeightSheetProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  entries: { date: string; kg: number }[]
}

export function WeightSheet({ open, onOpenChange, entries }: WeightSheetProps) {
  const recent = entries.slice(-7)
  const highest = recent.reduce((m, e) => (e.kg > m ? e.kg : m), 0)
  const latest = recent[recent.length - 1]?.kg ?? 0

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="Weight Log">
      <div className="flex gap-4 mb-5">
        <Stat label="Latest" value={latest ? `${latest} kg` : '—'} />
        <Stat label="Peak (7d)" value={highest ? `${highest} kg` : '—'} />
      </div>
      {recent.length > 0 ? (
        <>
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--muted)' }}>
            Trend
          </p>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={recent}>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--muted)' }} axisLine={false} tickLine={false} />
                <YAxis domain={['auto', 'auto']} hide />
                <Tooltip
                  contentStyle={{ background: 'var(--surface-3)', border: '1px solid var(--card-border)', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: 'var(--foreground)' }}
                  itemStyle={{ color: 'var(--foreground)' }}
                  formatter={(v) => [`${v} kg`, '']}
                />
                <Line dataKey="kg" stroke="var(--foreground)" strokeWidth={2} dot={{ r: 2, fill: 'var(--foreground)' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      ) : (
        <p className="text-sm py-6 text-center" style={{ color: 'var(--muted)' }}>
          No weight logs yet — start tracking from the Body tab.
        </p>
      )}
    </Sheet>
  )
}

/* ─── Active Days Sheet ───────────────────────────────────── */

interface ActiveSheetProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  activeDays: number
  streak: number
}

export function ActiveSheet({ open, onOpenChange, activeDays, streak }: ActiveSheetProps) {
  const now = new Date()
  const dayOfWeek = now.getDay() === 0 ? 7 : now.getDay()
  const dayOfMonth = now.getDate()

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="Activity">
      <div className="grid grid-cols-3 gap-3 mb-5">
        <Stat label="This week" value={`${Math.min(activeDays, dayOfWeek)}/${dayOfWeek}`} />
        <Stat label="This month" value={`${Math.min(activeDays, dayOfMonth)}/${dayOfMonth}`} />
        <Stat label="Streak" value={`${streak}d`} />
      </div>
      <div className="rounded-xl p-4" style={{ background: 'var(--surface-1)', border: '1px solid var(--card-border)' }}>
        <p className="text-xs" style={{ color: 'var(--muted)' }}>
          {streak > 0
            ? `${streak}-day streak. Keep it going.`
            : 'Log a workout today to start your streak.'}
        </p>
      </div>
    </Sheet>
  )
}

/* ─── Shared Stat block ───────────────────────────────────── */

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex-1 rounded-xl p-3" style={{ background: 'var(--surface-1)', border: '1px solid var(--card-border)' }}>
      <p className="text-[10px] mb-0.5" style={{ color: 'var(--muted)' }}>{label}</p>
      <p className="text-sm font-bold tabular" style={{ color: 'var(--foreground)' }}>{value}</p>
    </div>
  )
}

/* ─── Sheet state hook ────────────────────────────────────── */

export type StatSheetKey = 'streak' | 'active' | 'weight' | null

export function useStatSheet() {
  const [open, setOpen] = useState<StatSheetKey>(null)
  return { open, setOpen, close: () => setOpen(null) }
}
