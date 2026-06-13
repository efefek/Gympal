import type { Achievement } from './social'
import type { UserProfile } from './profile'

export interface Stats {
  totalWorkouts: number
  totalDistance: number
  streakDays: number
}

export function checkAchievements(profile: UserProfile, stats: Stats, existingAchievements: Achievement[]): Achievement[] {
  const unlocked: Achievement[] = []
  const existing = new Set(existingAchievements.map(a => a.key))

  if (stats.totalWorkouts >= 1 && !existing.has('first_workout')) {
    unlocked.push({
      id: `ach-${Date.now()}`,
      key: 'first_workout',
      unlockedAt: new Date().toISOString(),
      shared: false,
    })
  }

  if (stats.totalWorkouts >= 10 && !existing.has('10_workouts')) {
    unlocked.push({
      id: `ach-${Date.now()}-1`,
      key: '10_workouts',
      unlockedAt: new Date().toISOString(),
      shared: false,
    })
  }

  if (stats.totalDistance >= 50 && !existing.has('50km_run')) {
    unlocked.push({
      id: `ach-${Date.now()}-2`,
      key: '50km_run',
      unlockedAt: new Date().toISOString(),
      shared: false,
    })
  }

  if (stats.streakDays >= 30 && !existing.has('30day_streak')) {
    unlocked.push({
      id: `ach-${Date.now()}-3`,
      key: '30day_streak',
      unlockedAt: new Date().toISOString(),
      shared: false,
    })
  }

  return unlocked
}

export const ACHIEVEMENT_META: Record<string, { title: string; icon: string; description: string }> = {
  first_workout: {
    title: 'First Step',
    icon: '🎯',
    description: 'Complete your first workout',
  },
  '10_workouts': {
    title: 'Consistent Champion',
    icon: '⭐',
    description: 'Complete 10 workouts',
  },
  '50km_run': {
    title: '50km Runner',
    icon: '🏃',
    description: 'Total running distance: 50km',
  },
  '30day_streak': {
    title: 'Iron Will',
    icon: '🔥',
    description: '30-day activity streak',
  },
}
