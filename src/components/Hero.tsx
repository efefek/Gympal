'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  Settings, Dumbbell, MapPin, TreePine, Route,
  UserPlus, Play, Flame, Bike, Footprints, ChevronRight,
} from 'lucide-react'
import { getProfile, type UserProfile, goalLabels, experienceLabels } from '@/lib/profile'
import { getExercises } from '@/lib/musclewiki'
import { buildPreset, PRESETS } from '@/data/preset-programs'
import { t } from '@/lib/i18n'
import { ActivityScoreGauge } from './ActivityScoreGauge'
import { StatsRow } from './StatsRow'
import { ThemeToggle } from './ThemeToggle'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const STORAGE_KEY = 'gympal-program-custom'

const goalProgramNames: Record<string, string> = {
  build_muscle: 'Muscle Builder',
  lose_weight: 'Fat Burner',
  general_fitness: 'Full Fitness',
  flexibility: 'Flex & Mobility',
  endurance: 'Endurance Engine',
}

const goalDayFocus: Record<string, string[]> = {
  build_muscle: ['Push Day', 'Pull Day', 'Leg Day', 'Upper Body', 'Lower Body'],
  lose_weight: ['HIIT Circuit', 'Cardio Burn', 'Full Body', 'Core & Cardio'],
  general_fitness: ['Full Body A', 'Full Body B', 'Full Body C'],
  flexibility: ['Upper Flex', 'Lower Flex', 'Full Stretch'],
  endurance: ['Tempo Run', 'Intervals', 'Long Run', 'Recovery'],
}

const experienceDaysMap: Record<string, number> = {
  beginner: 3,
  intermediate: 4,
  advanced: 5,
}

type ActivityItem = {
  id: string
  label: string
  duration: string
  icon: typeof Bike
  fromColor: string
  toColor: string
}

const ACTIVITIES: ActivityItem[] = [
  { id: 'cycling', label: t.home.activities.cycling, duration: '45 min', icon: Bike, fromColor: '#0f2010', toColor: '#071007' },
  { id: 'running', label: t.home.activities.running, duration: '30 min', icon: Footprints, fromColor: '#0f1020', toColor: '#070710' },
  { id: 'strength', label: t.home.activities.strength, duration: '60 min', icon: Dumbbell, fromColor: '#1a0f0f', toColor: '#100707' },
]

export default function Hero() {
  const router = useRouter()
  const [loadingPreset, setLoadingPreset] = useState<string | null>(null)

  const [profile] = useState<UserProfile | null>(() => {
    if (typeof window === 'undefined') return null
    return getProfile()
  })

  const [{ programName, todayFocus, daysPerWeek }] = useState(() => {
    if (typeof window === 'undefined') return { programName: "Today's Workout", todayFocus: '', daysPerWeek: 3 }
    const p = getProfile()
    if (!p) return { programName: "Today's Workout", todayFocus: '', daysPerWeek: 3 }

    const days = experienceDaysMap[p.experience] || 3
    const todayDayOfWeek = new Date().getDay()
    const todayIdx = todayDayOfWeek === 0 ? 6 : todayDayOfWeek - 1

    try {
      const customRaw = localStorage.getItem(STORAGE_KEY)
      if (customRaw) {
        const custom = JSON.parse(customRaw)
        const name = (custom.name || goalProgramNames[p.goal] || 'Your Workout') as string
        const workoutDays = (custom.daysPerWeek || days) as number
        const dayData = custom.days?.[todayIdx % workoutDays] as { name?: string } | undefined
        return { programName: name, todayFocus: dayData?.name || '', daysPerWeek: days }
      }
    } catch {}

    const name = goalProgramNames[p.goal] || 'Your Workout'
    const focuses = goalDayFocus[p.goal] || []
    const focus = focuses.length > 0 ? focuses[todayIdx % focuses.length] : ''
    return { programName: name, todayFocus: focus, daysPerWeek: days }
  })

  // 0 = Mon … 6 = Sun (JS Sunday = 0 converted to index 6)
  const todayDayOfWeek = new Date().getDay()
  const todayIdx = todayDayOfWeek === 0 ? 6 : todayDayOfWeek - 1

  async function startPreset(id: string) {
    setLoadingPreset(id)
    try {
      const { exercises } = await getExercises({ limit: 1500 })
      const program = buildPreset(id, exercises)
      if (program) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(program))
        router.push('/program')
        return
      }
    } catch (error) {
      console.error('Failed to start preset', error)
    }
    setLoadingPreset(null)
  }

  return (
    <section className="relative mx-auto w-full max-w-lg flex-1 px-5 pt-6 pb-4 md:max-w-2xl">

      {/* ── Section 0: Header with Theme Toggle ── */}
      <header className="flex items-start justify-between mb-6 animate-fade-in">
        <div>
          <p className="text-sm text-muted mb-0.5">{t.home.welcome}</p>
          <h1 className="text-2xl font-bold tracking-tight">{t.home.greeting}</h1>
          {profile && (
            <p className="text-xs text-muted mt-0.5">
              {experienceLabels[profile.experience]} · {goalLabels[profile.goal]}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/settings"
            aria-label={t.settings.title}
            className="tap-scale flex size-10 items-center justify-center rounded-full border border-zinc-800 bg-surface-2 text-muted transition-colors hover:text-foreground"
          >
            <Settings className="size-4" aria-hidden="true" />
          </Link>
          <Link
            href="/profile"
            aria-label="Open profile"
            className="tap-scale flex size-10 items-center justify-center rounded-full border border-zinc-800 bg-surface-2 font-bold text-sm text-primary"
          >
            {profile
              ? (experienceLabels[profile.experience]?.[0] ?? 'U')
              : <UserPlus className="size-4" aria-hidden="true" />}
          </Link>
        </div>
      </header>

      {/* ── Section 1a: Activity Score Gauge (NEW) ── */}
      <ActivityScoreGauge score={75} streak={5} />

      {/* ── Section 1b: Stats Row (NEW) ── */}
      <StatsRow totalDistance={12.5} totalWeight={850} activeDays={4} />

      {/* ── Section 2: Training Plan + Day Pills ── */}
      <div className="mb-5 animate-fade-in-up">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{t.home.trainingPlan}</span>
          <Link href="/program" className="text-xs text-primary hover:underline transition-colors">
            {t.common.seeAll} →
          </Link>
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1">
          {DAYS.map((day, i) => {
            const isToday = i === todayIdx
            const isWorkoutDay = profile ? i < daysPerWeek : false
            return (
              <Link
                key={day}
                href="/program"
                aria-label={`${day}${isWorkoutDay ? ', workout' : ', rest'}${isToday ? ', today' : ''}`}
                className={`tap-scale flex min-w-[42px] flex-1 flex-col items-center gap-1.5 rounded-2xl py-3 transition-colors ${
                  isToday
                    ? 'bg-primary text-black'
                    : isWorkoutDay
                    ? 'border border-primary/25 bg-surface-2 text-primary'
                    : 'border border-zinc-800/50 bg-surface-1 text-zinc-600'
                }`}
              >
                <span className={`text-[10px] font-medium ${isToday ? 'text-black/60' : ''}`}>{day}</span>
                <div
                  className={`size-1.5 rounded-full ${
                    isWorkoutDay ? (isToday ? 'bg-black/30' : 'bg-primary') : 'bg-transparent'
                  }`}
                />
              </Link>
            )
          })}
        </div>
      </div>

      {/* ── Section 3: Workout Card ── */}
      {profile ? (
        <WorkoutCard
          programName={programName}
          todayFocus={todayFocus}
          goal={profile.goal}
          experience={profile.experience}
        />
      ) : (
        <OnboardingCard />
      )}

      {/* ── Section 4: Quick Programs ── */}
      <div className="mt-7 animate-fade-in-up">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3 block">{t.home.quickPrograms}</span>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-1 px-1 pb-1">
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              disabled={loadingPreset !== null}
              onClick={() => startPreset(preset.id)}
              className="tap-scale shrink-0 w-[180px] text-left rounded-2xl border border-zinc-800 bg-surface-1 p-4 transition-colors hover:border-primary/40 hover:bg-surface-2 disabled:opacity-50"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center rounded-full bg-primary-dim px-2.5 py-1 text-[11px] font-medium text-primary">
                  {preset.tag}
                </span>
                {loadingPreset === preset.id
                  ? <span className="size-4 rounded-full border-2 border-primary border-t-transparent animate-spin" aria-label={t.common.loading} />
                  : <Play className="size-4 text-zinc-500" aria-hidden="true" />}
              </div>
              <p className="font-semibold text-sm text-foreground">{preset.name}</p>
              <p className="text-xs text-zinc-500 mt-0.5">{preset.description}</p>
              <p className="text-[11px] text-zinc-600 mt-2">{preset.durationLabel}</p>
            </button>
          ))}
        </div>
      </div>

      {/* ── Section 5: My Activity ── */}
      <div className="mt-7 animate-fade-in-up">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3 block">{t.home.myActivity}</span>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-1 px-1 pb-1">
          {ACTIVITIES.map((a) => {
            const Icon = a.icon
            return (
              <div
                key={a.id}
                style={{ background: `linear-gradient(135deg, ${a.fromColor} 0%, ${a.toColor} 100%)` }}
                className="tap-scale shrink-0 min-w-[140px] h-[92px] rounded-2xl border border-zinc-800/40 p-3.5 flex flex-col justify-between"
              >
                <span className="flex size-8 items-center justify-center rounded-lg bg-black/30 text-primary">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-xs font-semibold text-foreground">{a.label}</p>
                  <p className="text-[11px] text-zinc-500">{a.duration}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Explore quick grid ── */}
      <div className="mt-7 animate-fade-in-up">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3 block">{t.home.explore}</span>
        <div className="grid grid-cols-3 gap-3">
          {[
            { href: '/gyms', icon: MapPin, title: 'Gyms', desc: 'Near you' },
            { href: '/parks', icon: TreePine, title: 'Parks', desc: 'Outdoor' },
            { href: '/routes', icon: Route, title: 'Routes', desc: 'Cycling' },
          ].map((f) => {
            const Icon = f.icon
            return (
              <Link
                key={f.href}
                href={f.href}
                className="tap-scale group flex flex-col gap-3 rounded-2xl border border-zinc-800 bg-surface-1 p-4 transition-colors hover:border-primary/40 hover:bg-surface-2"
              >
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary-dim text-primary transition-colors group-hover:bg-primary-mid">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-foreground">{f.title}</span>
                  <span className="block text-xs text-zinc-500">{f.desc}</span>
                </span>
              </Link>
            )
          })}
        </div>
      </div>

    </section>
  )
}

function WorkoutCard({
  programName,
  todayFocus,
  goal,
  experience,
}: {
  programName: string
  todayFocus: string
  goal: string
  experience: string
}) {
  const goalTag = (goalLabels as Record<string, string>)[goal] || 'Fitness'
  const expTag = (experienceLabels as Record<string, string>)[experience] || 'Beginner'

  return (
    <Link
      href="/program"
      className="tap-scale block overflow-hidden rounded-3xl border border-primary/20 p-5 shadow-[0_0_40px_rgba(57,255,20,0.07)] animate-fade-in-up"
      style={{ background: 'linear-gradient(135deg, #0d1f0d 0%, #0a0a0a 100%)' }}
    >
      <p className="text-xs text-zinc-500 mb-3">{t.home.todaysPlan}</p>

      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-bold leading-tight truncate">
            {todayFocus || programName}
          </h2>
          {todayFocus && (
            <p className="text-sm text-zinc-400 mt-0.5">{programName}</p>
          )}
          <div className="flex items-center gap-2 mt-3">
            <span className="inline-flex items-center gap-1 rounded-full bg-surface-3 px-2.5 py-1 text-[11px] font-medium text-zinc-300">
              <Flame className="size-3 text-primary" aria-hidden="true" />
              {goalTag}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-surface-3 px-2.5 py-1 text-[11px] font-medium text-zinc-300">
              {expTag}
            </span>
          </div>
        </div>
        <ProgressRing percent={0} />
      </div>

      <div className="flex items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-bold text-black">
        <Play className="size-4 fill-black" aria-hidden="true" />
        {t.home.continueWorkout}
      </div>
    </Link>
  )
}

function OnboardingCard() {
  return (
    <div
      className="rounded-3xl border border-zinc-800 p-5 animate-fade-in-up"
      style={{ background: 'linear-gradient(135deg, #141414 0%, #0a0a0a 100%)' }}
    >
      <div className="flex size-12 items-center justify-center rounded-2xl bg-primary-dim mb-4">
        <Dumbbell className="size-6 text-primary" aria-hidden="true" />
      </div>
      <h2 className="text-xl font-bold mb-1.5">{t.home.onboardingTitle}</h2>
      <p className="text-sm text-zinc-500 mb-5">{t.home.onboardingDesc}</p>
      <Link
        href="/profile/edit"
        className="tap-scale flex items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-bold text-black"
      >
        <UserPlus className="size-4" aria-hidden="true" />
        {t.home.createProfile}
        <ChevronRight className="size-4" aria-hidden="true" />
      </Link>
    </div>
  )
}

const RING_RADIUS = 26
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

function ProgressRing({ percent }: { percent: number }) {
  const offset = RING_CIRCUMFERENCE - (percent / 100) * RING_CIRCUMFERENCE
  return (
    <div className="relative shrink-0" aria-hidden="true">
      <svg width="64" height="64" viewBox="0 0 64 64" className="-rotate-90">
        <circle cx="32" cy="32" r={RING_RADIUS} fill="none" stroke="#27272a" strokeWidth="5" />
        <circle
          cx="32"
          cy="32"
          r={RING_RADIUS}
          fill="none"
          stroke="var(--primary)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={RING_CIRCUMFERENCE}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
        {percent}%
      </span>
    </div>
  )
}
