'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import {
  Settings, Dumbbell, MapPin, TreePine, Route,
  UserPlus, Play, ChevronRight, ArrowRight,
} from 'lucide-react'
import { motion } from 'motion/react'
import { getProfile, type UserProfile, goalLabels, experienceLabels } from '@/lib/profile'
import { getExercises } from '@/lib/musclewiki'
import { buildPreset, PRESETS } from '@/data/preset-programs'
import { t } from '@/lib/i18n'
import { getLifetimeStats } from '@/lib/tracker'
import { StatsRow } from './StatsRow'
import { ThemeToggle } from './ThemeToggle'
import { useMotionVariants } from '@/lib/motion'

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
  beginner: 3, intermediate: 4, advanced: 5,
}

export default function Hero() {
  const router = useRouter()
  const [loadingPreset, setLoadingPreset] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [workoutInfo, setWorkoutInfo] = useState({ programName: "Today's Workout", todayFocus: '', daysPerWeek: 3 })
  const [stats, setStats] = useState({ currentWeightKg: 0, activeDays: 0, streak: 0, weightEntries: [] as { date: string; kg: number }[] })

  const { fadeUp, staggerContainer } = useMotionVariants()

  useEffect(() => {
    // SSR-safe: localStorage okuma yalnızca mount sonrası — kasıtlı set-state-in-effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
    const p = getProfile()
    setProfile(p)

    const lifetimeStats = getLifetimeStats()
    setStats({
      currentWeightKg: lifetimeStats.currentWeightKg,
      activeDays: lifetimeStats.activeDays,
      streak: lifetimeStats.currentStreak,
      weightEntries: lifetimeStats.lastSevenDaysWeights,
    })

    if (!p) {
      setWorkoutInfo({ programName: "Today's Workout", todayFocus: '', daysPerWeek: 3 })
      return
    }

    const days = experienceDaysMap[p.experience] || 3
    const todayDayOfWeek = new Date().getDay()
    const todayIdx = todayDayOfWeek === 0 ? 6 : todayDayOfWeek - 1

    try {
      const customRaw = localStorage.getItem(STORAGE_KEY)
      if (customRaw) {
        const custom = JSON.parse(customRaw) as { name?: string; daysPerWeek?: number; days?: { name?: string }[] }
        const name = custom.name || goalProgramNames[p.goal] || 'Your Workout'
        const workoutDays = custom.daysPerWeek || days
        const dayData = custom.days?.[todayIdx % workoutDays]
        setWorkoutInfo({ programName: name, todayFocus: dayData?.name || '', daysPerWeek: days })
        return
      }
    } catch { /* ignore */ }

    const name = goalProgramNames[p.goal] || 'Your Workout'
    const focuses = goalDayFocus[p.goal] || []
    const focus = focuses.length > 0 ? focuses[todayIdx % focuses.length] : ''
    setWorkoutInfo({ programName: name, todayFocus: focus, daysPerWeek: days })
  }, [])

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

  const { programName, todayFocus, daysPerWeek } = workoutInfo

  return (
    <section className="relative mx-auto w-full max-w-lg flex-1 px-5 pt-7 pb-4 md:max-w-2xl">

      {/* ── Header ── */}
      <motion.header
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="flex items-start justify-between mb-7"
      >
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] mb-1" style={{ color: 'var(--muted)' }}>
            GymPal
          </p>
          <h1 className="text-4xl font-bold tracking-tight leading-none">{t.home.greeting}</h1>
          <p className="text-xs mt-2 h-4" style={{ color: 'var(--muted)' }}>
            {mounted && profile ? `${experienceLabels[profile.experience]} · ${goalLabels[profile.goal]}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <Link
            href="/settings"
            aria-label={t.settings.title}
            className="flex size-10 items-center justify-center rounded-full border"
            style={{ borderColor: 'var(--card-border)', background: 'var(--surface-1)', color: 'var(--muted)' }}
          >
            <Settings className="size-4" aria-hidden="true" />
          </Link>
          <Link
            href="/profile"
            aria-label="Open profile"
            className="flex size-10 items-center justify-center rounded-full border text-sm font-bold"
            style={{ borderColor: 'var(--card-border)', background: 'var(--surface-1)', color: 'var(--foreground)' }}
          >
            {mounted && profile
              ? (experienceLabels[profile.experience]?.[0] ?? 'U')
              : <UserPlus className="size-4" aria-hidden="true" />}
          </Link>
        </div>
      </motion.header>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-8"
      >
        {/* ── Today's Plan — flat Swiss card ── */}
        <motion.div variants={fadeUp}>
          {!mounted ? (
            <div className="rounded-3xl border" style={{ minHeight: 196, background: 'var(--surface-1)', borderColor: 'var(--card-border)' }} />
          ) : profile ? (
            <WorkoutCard programName={programName} todayFocus={todayFocus} goal={profile.goal} experience={profile.experience} />
          ) : (
            <OnboardingCard />
          )}
        </motion.div>

        {/* ── Stats Row — 3 real cards ── */}
        <motion.div variants={fadeUp}>
          <StatsRow
            currentWeightKg={stats.currentWeightKg}
            activeDays={stats.activeDays}
            streak={stats.streak}
            weightEntries={stats.weightEntries}
          />
        </motion.div>

        {/* ── Training Plan day pills ── */}
        <motion.div variants={fadeUp}>
          <SectionLabel label={t.home.trainingPlan} href="/program" linkText={t.common.seeAll} />
          <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1">
            {DAYS.map((day, i) => {
              const isToday = i === todayIdx
              const isWorkoutDay = mounted && profile ? i < daysPerWeek : false
              return (
                <Link
                  key={day}
                  href="/program"
                  aria-label={`${day}${isWorkoutDay ? ', workout' : ', rest'}${isToday ? ', today' : ''}`}
                  className={`flex min-w-[42px] flex-1 flex-col items-center gap-1.5 rounded-2xl py-3 ${isToday ? 'btn-ink' : ''}`}
                  style={isToday ? undefined : {
                    background: isWorkoutDay ? 'var(--surface-1)' : 'transparent',
                    border: `1px solid ${isWorkoutDay ? 'var(--card-border)' : 'transparent'}`,
                    color: isWorkoutDay ? 'var(--foreground)' : 'var(--muted)',
                  }}
                >
                  <span className="text-[10px] font-medium">{day}</span>
                  <div
                    className="size-1.5 rounded-full"
                    style={{ background: isWorkoutDay ? (isToday ? 'var(--ink-text)' : 'var(--foreground)') : 'transparent' }}
                  />
                </Link>
              )
            })}
          </div>
        </motion.div>

        {/* ── Quick Programs ── */}
        <motion.div variants={fadeUp}>
          <SectionLabel label={t.home.quickPrograms} />
          <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-1 px-1 pb-1">
            {PRESETS.map((preset, i) => (
              <motion.button
                key={preset.id}
                type="button"
                disabled={loadingPreset !== null}
                onClick={() => startPreset(preset.id)}
                whileTap={{ scale: 0.97 }}
                className="shrink-0 w-[180px] text-left rounded-2xl p-4 transition-colors disabled:opacity-50"
                style={{ background: 'var(--surface-1)', border: '1px solid var(--card-border)' }}
              >
                <div className="flex items-center justify-between mb-5">
                  <span className="text-base font-bold tabular" style={{ color: 'var(--foreground)' }}>0{i + 1}</span>
                  {loadingPreset === preset.id
                    ? <span className="size-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--foreground)', borderTopColor: 'transparent' }} aria-label={t.common.loading} />
                    : <Play className="size-4" style={{ color: 'var(--muted)' }} aria-hidden="true" />}
                </div>
                <p className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>{preset.name}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{preset.description}</p>
                <p className="text-[11px] mt-2" style={{ color: 'var(--muted)' }}>{preset.durationLabel}</p>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* ── Explore ── */}
        <motion.div variants={fadeUp}>
          <SectionLabel label={t.home.explore} />
          <div className="grid grid-cols-3 gap-3">
            {[
              { href: '/gyms',   icon: MapPin,   title: 'Gyms',   desc: 'Near you' },
              { href: '/parks',  icon: TreePine, title: 'Parks',  desc: 'Outdoor'  },
              { href: '/routes', icon: Route,    title: 'Routes', desc: 'Cycling'  },
            ].map((f) => {
              const Icon = f.icon
              return (
                <motion.div key={f.href} whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    href={f.href}
                    className="group flex flex-col gap-4 rounded-2xl p-4"
                    style={{ background: 'var(--surface-1)', border: '1px solid var(--card-border)' }}
                  >
                    <Icon className="size-5" style={{ color: 'var(--foreground)' }} aria-hidden="true" />
                    <span>
                      <span className="block text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{f.title}</span>
                      <span className="block text-xs" style={{ color: 'var(--muted)' }}>{f.desc}</span>
                    </span>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </motion.div>

    </section>
  )
}

/* ─── Section label ───────────────────────────────────────── */

function SectionLabel({ label, href, linkText }: { label: string; href?: string; linkText?: string }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <span className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--muted)' }}>
        {label}
      </span>
      {href && linkText && (
        <Link href={href} className="inline-flex items-center gap-1 text-xs hover:underline" style={{ color: 'var(--foreground)' }}>
          {linkText} <ArrowRight className="size-3" aria-hidden="true" />
        </Link>
      )}
    </div>
  )
}

/* ─── WorkoutCard ─────────────────────────────────────────── */

function WorkoutCard({ programName, todayFocus, goal, experience }: {
  programName: string; todayFocus: string; goal: string; experience: string
}) {
  const goalTag = (goalLabels as Record<string, string>)[goal] || 'Fitness'
  const expTag = (experienceLabels as Record<string, string>)[experience] || 'Beginner'

  return (
    <motion.div whileTap={{ scale: 0.99 }}>
      <Link
        href="/program"
        className="block rounded-3xl p-6"
        style={{ background: 'var(--surface-1)', border: '1px solid var(--card-border)' }}
      >
        <div className="flex items-start justify-between gap-3 mb-6">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] mb-2" style={{ color: 'var(--muted)' }}>
              {t.home.todaysPlan}
            </p>
            <h2 className="text-2xl font-bold leading-tight tracking-tight truncate">
              {todayFocus || programName}
            </h2>
            {todayFocus && (
              <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>{programName}</p>
            )}
          </div>
          <div className="text-right shrink-0">
            <p className="text-3xl font-bold tabular leading-none">0<span className="text-base font-normal" style={{ color: 'var(--muted)' }}>%</span></p>
            <p className="text-[10px] mt-1" style={{ color: 'var(--muted)' }}>done</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-6">
          <Tag>{goalTag}</Tag>
          <Tag>{expTag}</Tag>
        </div>

        <motion.div
          whileHover={{ scale: 1.01 }}
          className="btn-ink flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold"
        >
          <Play className="size-4" style={{ fill: 'var(--ink-text)' }} aria-hidden="true" />
          {t.home.continueWorkout}
        </motion.div>
      </Link>
    </motion.div>
  )
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium"
      style={{ background: 'var(--surface-2)', color: 'var(--muted)', border: '1px solid var(--card-border)' }}
    >
      {children}
    </span>
  )
}

/* ─── OnboardingCard ──────────────────────────────────────── */

function OnboardingCard() {
  return (
    <div className="rounded-3xl p-6" style={{ background: 'var(--surface-1)', border: '1px solid var(--card-border)' }}>
      <div className="flex size-12 items-center justify-center rounded-2xl mb-4" style={{ background: 'var(--surface-2)' }}>
        <Dumbbell className="size-6" style={{ color: 'var(--foreground)' }} aria-hidden="true" />
      </div>
      <h2 className="text-2xl font-bold tracking-tight mb-1.5">{t.home.onboardingTitle}</h2>
      <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>{t.home.onboardingDesc}</p>
      <motion.div whileTap={{ scale: 0.98 }} whileHover={{ scale: 1.01 }}>
        <Link
          href="/profile/edit"
          className="btn-ink flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold"
        >
          <UserPlus className="size-4" aria-hidden="true" />
          {t.home.createProfile}
          <ChevronRight className="size-4" aria-hidden="true" />
        </Link>
      </motion.div>
    </div>
  )
}
