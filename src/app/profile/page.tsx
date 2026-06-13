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
    <div className="mx-auto w-full max-w-lg flex-1 px-5 pt-6 pb-28 md:max-w-2xl">

      {/* Header */}
      <header className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold tracking-tight">{t.dashboard.title}</h1>
        <Link
          href="/settings"
          aria-label={t.settings.title}
          className="tap-scale flex size-10 items-center justify-center rounded-full border border-zinc-800 bg-surface-2 text-zinc-400 transition-colors hover:text-zinc-200"
        >
          <Settings className="size-4" aria-hidden="true" />
        </Link>
      </header>

      {/* Profile summary / onboarding */}
      {mounted && profile ? (
        <div className="rounded-2xl border border-zinc-800 bg-surface-1 p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">
                {goalLabels[profile.goal]} · {experienceLabels[profile.experience]}
              </p>
              <p className="text-xs text-zinc-500 mt-0.5">
                {profile.height} cm · {profile.weight} kg
              </p>
            </div>
            <Link
              href="/profile/edit"
              className="tap-scale flex items-center gap-1.5 rounded-xl border border-zinc-800 px-3 py-2 text-xs font-medium text-zinc-300 transition-colors hover:border-primary/40 hover:text-primary"
            >
              <Pencil className="size-3.5" aria-hidden="true" />
              {t.dashboard.editProfile}
            </Link>
          </div>
        </div>
      ) : (
        <Link
          href="/profile/edit"
          className="tap-scale flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary-dim/30 p-4 mb-4"
        >
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary-dim text-primary">
            <UserPlus className="size-5" aria-hidden="true" />
          </span>
          <span className="text-sm text-zinc-300">{t.dashboard.noProfile}</span>
        </Link>
      )}

      {/* Health row: BMI + Weight (only with profile metrics) */}
      {mounted && profile && (
        <div className="grid grid-cols-2 gap-4 mb-4">
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
