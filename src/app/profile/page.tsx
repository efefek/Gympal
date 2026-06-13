'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Pencil, UserPlus, Settings } from 'lucide-react'
import { getProfile, goalLabels, experienceLabels, type UserProfile } from '@/lib/profile'
import { useMounted } from '@/lib/hooks'
import { t } from '@/lib/i18n'
import BmiCard from '@/components/dashboard/BmiCard'
import WeightChart from '@/components/dashboard/WeightChart'
import MoodTracker from '@/components/dashboard/MoodTracker'
import DailyChecklist from '@/components/dashboard/DailyChecklist'
import TodoList from '@/components/dashboard/TodoList'
import ShoppingList from '@/components/dashboard/ShoppingList'
import MealPlanner from '@/components/dashboard/MealPlanner'
import MiniCalendar from '@/components/dashboard/MiniCalendar'

export default function DashboardPage() {
  const mounted = useMounted()
  const [profile] = useState<UserProfile | null>(() => {
    if (typeof window === 'undefined') return null
    return getProfile()
  })

  return (
    <div className="mx-auto w-full max-w-lg flex-1 px-5 pt-7 pb-28 md:max-w-2xl">

      {/* Header */}
      <header className="mb-6 flex items-end justify-between">
        <div>
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--muted)' }}>
            Companion
          </p>
          <h1 className="font-mono text-4xl font-bold leading-none tracking-normal">{t.dashboard.title}</h1>
        </div>
        <Link
          href="/settings"
          aria-label={t.settings.title}
          className="tap-scale flex size-10 items-center justify-center border-2 transition-colors"
          style={{ borderColor: 'var(--foreground)', color: 'var(--foreground)' }}
        >
          <Settings className="size-4" aria-hidden="true" />
        </Link>
      </header>

      {/* Profile summary / onboarding */}
      {mounted && profile ? (
        <div className="mb-4 border-[3px] p-4" style={{ background: 'var(--surface-1)', borderColor: 'var(--foreground)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-sm font-bold text-foreground">
                {goalLabels[profile.goal]} · {experienceLabels[profile.experience]}
              </p>
              <p className="mt-0.5 text-xs" style={{ color: 'var(--muted)' }}>
                {profile.height} cm · {profile.weight} kg
              </p>
            </div>
            <Link
              href="/profile/edit"
              className="btn-ink tap-scale flex items-center gap-1.5 px-3 py-2 text-xs font-bold"
            >
              <Pencil className="size-3.5" aria-hidden="true" />
              {t.dashboard.editProfile}
            </Link>
          </div>
        </div>
      ) : (
        <Link
          href="/profile/edit"
          className="tap-scale mb-4 flex items-center gap-3 border-[3px] p-4"
          style={{ background: 'var(--surface-1)', borderColor: 'var(--foreground)' }}
        >
          <span className="btn-ink flex size-10 items-center justify-center">
            <UserPlus className="size-5" aria-hidden="true" />
          </span>
          <span className="text-sm font-semibold">{t.dashboard.noProfile}</span>
        </Link>
      )}

      {/* Health row: BMI + Weight (only with profile metrics) */}
      {mounted && profile && (
        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <BmiCard height={profile.height} weight={profile.weight} />
          <WeightChart />
        </div>
      )}

      {/* Mood + Checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <MoodTracker />
        <DailyChecklist />
      </div>

      {/* Lists */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <TodoList />
        <ShoppingList />
      </div>

      {/* Meal plan */}
      <div className="mb-4">
        <MealPlanner />
      </div>

      {/* Calendar */}
      <MiniCalendar />
    </div>
  )
}
