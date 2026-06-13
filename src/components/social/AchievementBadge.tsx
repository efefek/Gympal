"use client"

import { Lock } from 'lucide-react'
import { ACHIEVEMENT_META } from '@/lib/achievements'
import type { Achievement } from '@/lib/social'

interface AchievementBadgeProps {
  achievementKey: Achievement['key']
  unlocked: boolean
  onShare?: (key: Achievement['key']) => void
}

export function AchievementBadge({ achievementKey, unlocked, onShare }: AchievementBadgeProps) {
  const meta = ACHIEVEMENT_META[achievementKey]
  if (!meta) return null

  return (
    <div className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
      unlocked
        ? 'border-primary/50 bg-primary-dim/20'
        : 'border-zinc-700 bg-zinc-900/50 opacity-50'
    }`}>
      <span className="text-4xl">{meta.icon}</span>
      <div className="text-center">
        <p className="text-xs font-semibold">{meta.title}</p>
        <p className="text-xs text-zinc-400 mt-1">{meta.description}</p>
      </div>
      {!unlocked && <Lock className="size-4 text-zinc-500" />}
      {unlocked && (
        <button
          onClick={() => onShare?.(achievementKey)}
          className="text-xs px-2 py-1 rounded-md bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
        >
          Share
        </button>
      )}
    </div>
  )
}
