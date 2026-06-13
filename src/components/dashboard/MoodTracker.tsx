'use client'

import { useState } from 'react'
import { logMood, getMoodFor, todayKey, type MoodLevel } from '@/lib/tracker'
import { useMounted } from '@/lib/hooks'
import { t } from '@/lib/i18n'

const LEVELS: MoodLevel[] = [1, 2, 3, 4, 5]

/** Custom SVG face per mood level — mouth curvature scales with the level (no emoji). */
function MoodFace({ level, active }: { level: MoodLevel; active: boolean }) {
  // curve: level 1 = frown (positive control-Y), level 5 = big smile (negative)
  const curve = (3 - level) * 6 // 12 … -12
  const color = active ? '#000' : 'currentColor'
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <circle cx="9.5" cy="11" r="1.6" fill={color} />
      <circle cx="18.5" cy="11" r="1.6" fill={color} />
      <path
        d={`M 8 ${18} Q 14 ${18 + curve} 20 18`}
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}

export default function MoodTracker() {
  const mounted = useMounted()
  const today = todayKey()
  const [level, setLevel] = useState<MoodLevel | null>(() => getMoodFor(today)?.level ?? null)

  function select(value: MoodLevel) {
    setLevel(value)
    logMood(value, today)
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-surface-1 p-4">
      <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{t.dashboard.mood.title}</span>
      <p className="text-sm text-zinc-400 mt-1 mb-3">{t.dashboard.mood.question}</p>

      <div className="flex items-center justify-between gap-2">
        {LEVELS.map((value) => {
          const active = mounted && level === value
          return (
            <button
              key={value}
              type="button"
              aria-pressed={active}
              aria-label={t.dashboard.mood.levels[value - 1]}
              onClick={() => select(value)}
              className={`tap-scale flex size-11 items-center justify-center rounded-full transition-colors ${
                active ? 'bg-primary text-black' : 'bg-surface-2 text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <MoodFace level={value} active={active} />
            </button>
          )
        })}
      </div>
    </div>
  )
}
