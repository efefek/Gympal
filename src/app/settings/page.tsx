'use client'

import Link from 'next/link'
import { Dumbbell, Pencil, RotateCcw, Trash2, ChevronRight, Info } from 'lucide-react'
import { clearProfile } from '@/lib/profile'
import {
  weightStore, moodStore, checklistStore, todoStore, shoppingStore, mealStore,
} from '@/lib/tracker'
import { t } from '@/lib/i18n'

const APP_VERSION = '0.2.0'
const PROGRAM_KEY = 'gympal-program-custom'

export default function SettingsPage() {
  function resetProgram() {
    localStorage.removeItem(PROGRAM_KEY)
    window.location.href = '/program'
  }

  function clearAllData() {
    if (!window.confirm(t.settings.clearDataConfirm)) return
    clearProfile()
    localStorage.removeItem(PROGRAM_KEY)
    weightStore.clear()
    moodStore.clear()
    checklistStore.clear()
    todoStore.clear()
    shoppingStore.clear()
    mealStore.clear()
    window.location.href = '/'
  }

  return (
    <div className="mx-auto w-full max-w-lg flex-1 px-5 pt-6 pb-28 md:max-w-2xl">
      <h1 className="text-2xl font-bold tracking-tight mb-6">{t.settings.title}</h1>

      <div className="space-y-3">
        {/* All Exercises */}
        <Link
          href="/exercises"
          className="tap-scale flex items-center gap-3 rounded-2xl border border-zinc-800 bg-surface-1 p-4 transition-colors hover:border-primary/40 hover:bg-surface-2"
        >
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary-dim text-primary">
            <Dumbbell className="size-5" aria-hidden="true" />
          </span>
          <span className="flex-1 min-w-0">
            <span className="block text-sm font-semibold text-foreground">{t.settings.allExercises}</span>
            <span className="block text-xs text-zinc-500">{t.settings.allExercisesDesc}</span>
          </span>
          <ChevronRight className="size-4 text-zinc-600" aria-hidden="true" />
        </Link>

        {/* Edit Profile */}
        <Link
          href="/profile/edit"
          className="tap-scale flex items-center gap-3 rounded-2xl border border-zinc-800 bg-surface-1 p-4 transition-colors hover:border-primary/40 hover:bg-surface-2"
        >
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary-dim text-primary">
            <Pencil className="size-5" aria-hidden="true" />
          </span>
          <span className="flex-1 min-w-0">
            <span className="block text-sm font-semibold text-foreground">{t.settings.editProfile}</span>
            <span className="block text-xs text-zinc-500">{t.settings.editProfileDesc}</span>
          </span>
          <ChevronRight className="size-4 text-zinc-600" aria-hidden="true" />
        </Link>

        {/* Reset Program */}
        <button
          type="button"
          onClick={resetProgram}
          className="tap-scale flex w-full items-center gap-3 rounded-2xl border border-zinc-800 bg-surface-1 p-4 text-left transition-colors hover:border-primary/40 hover:bg-surface-2"
        >
          <span className="flex size-10 items-center justify-center rounded-xl bg-surface-3 text-zinc-300">
            <RotateCcw className="size-5" aria-hidden="true" />
          </span>
          <span className="flex-1 min-w-0">
            <span className="block text-sm font-semibold text-foreground">{t.settings.resetProgram}</span>
            <span className="block text-xs text-zinc-500">{t.settings.resetProgramDesc}</span>
          </span>
        </button>

        {/* Clear All Data */}
        <button
          type="button"
          onClick={clearAllData}
          className="tap-scale flex w-full items-center gap-3 rounded-2xl border border-red-900/40 bg-red-950/10 p-4 text-left transition-colors hover:border-red-800/60"
        >
          <span className="flex size-10 items-center justify-center rounded-xl bg-red-950/40 text-red-400">
            <Trash2 className="size-5" aria-hidden="true" />
          </span>
          <span className="flex-1 min-w-0">
            <span className="block text-sm font-semibold text-red-300">{t.settings.clearData}</span>
            <span className="block text-xs text-red-400/70">{t.settings.clearDataDesc}</span>
          </span>
        </button>
      </div>

      {/* About */}
      <div className="mt-6 flex items-center gap-2 text-xs text-zinc-600">
        <Info className="size-3.5" aria-hidden="true" />
        GymPal · {t.settings.version} {APP_VERSION}
      </div>
    </div>
  )
}
