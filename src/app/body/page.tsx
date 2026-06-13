'use client'

import { useState } from 'react'
import { useMounted } from '@/lib/hooks'
import { getMeasurements, getVitals, todayKey } from '@/lib/tracker'
import { getProfile } from '@/lib/profile'

export default function BodyPage() {
  const mounted = useMounted()
  const [timeRange, setTimeRange] = useState<'1W' | '1M' | '3M' | '1Y'>('1W')

  const measurements = mounted ? getMeasurements() : []
  const vitals = mounted ? getVitals() : []
  const profile = mounted ? getProfile() : null
  const today = todayKey()
  const todayMeasurement = measurements.find(m => m.date === today)

  if (!mounted) return null

  return (
    <div className="mx-auto w-full max-w-lg flex-1 px-5 pt-6 pb-4 md:max-w-2xl">
      <header className="mb-6 animate-fade-in">
        <h1 className="text-2xl font-bold tracking-tight">Body & Health</h1>
        <p className="text-xs text-zinc-500 mt-1">Track your measurements and health vitals</p>
      </header>

      {/* Body Stats Card */}
      <div className="animate-fade-in-up rounded-2xl border border-zinc-800 bg-surface-1 p-5 mb-6">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <p className="text-xs text-zinc-500 mb-1">Weight</p>
            <p className="text-2xl font-bold text-foreground">
              {todayMeasurement?.weight || profile?.weight || '—'}<span className="text-sm text-zinc-500"> kg</span>
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-1">Height</p>
            <p className="text-2xl font-bold text-foreground">
              {todayMeasurement?.height || profile?.height || '—'}<span className="text-sm text-zinc-500"> cm</span>
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-1">Waist</p>
            <p className="text-2xl font-bold text-foreground">
              {todayMeasurement?.waistCirc || '—'}<span className="text-sm text-zinc-500"> cm</span>
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-1">Arm</p>
            <p className="text-2xl font-bold text-foreground">
              {todayMeasurement?.armCirc || '—'}<span className="text-sm text-zinc-500"> cm</span>
            </p>
          </div>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="animate-fade-in-up flex gap-2 mb-6">
        {(['1W', '1M', '3M', '1Y'] as const).map(range => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-3 py-1 text-xs rounded-lg transition-colors ${
              timeRange === range
                ? 'bg-primary text-black'
                : 'bg-surface-2 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {range}
          </button>
        ))}
      </div>

      {/* Vitals Grid */}
      <div className="animate-fade-in-up grid grid-cols-2 gap-3 mb-6">
        <div className="rounded-xl border border-zinc-800 bg-surface-1 p-3">
          <p className="text-xs text-zinc-500 mb-2">Water</p>
          <p className="text-xl font-bold text-foreground">{vitals.length > 0 ? '2.0' : '—'} <span className="text-xs text-zinc-500">L</span></p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-surface-1 p-3">
          <p className="text-xs text-zinc-500 mb-2">Protein</p>
          <p className="text-xl font-bold text-foreground">{vitals.length > 0 ? '120' : '—'} <span className="text-xs text-zinc-500">g</span></p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-surface-1 p-3">
          <p className="text-xs text-zinc-500 mb-2">Steps</p>
          <p className="text-xl font-bold text-foreground">{vitals.length > 0 ? '8.5K' : '—'} <span className="text-xs text-zinc-500">steps</span></p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-surface-1 p-3">
          <p className="text-xs text-zinc-500 mb-2">Heart Rate</p>
          <p className="text-xl font-bold text-foreground">{vitals.length > 0 ? '72' : '—'} <span className="text-xs text-zinc-500">bpm</span></p>
        </div>
      </div>

      {/* CTA */}
      <button className="w-full animate-fade-in-up py-3 rounded-2xl bg-primary text-black font-semibold hover:bg-primary/90 transition-colors">
        Log Measurements
      </button>
    </div>
  )
}
