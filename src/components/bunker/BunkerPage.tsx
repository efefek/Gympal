'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Settings, UserPlus, Play, ChevronLeft, ChevronRight, Plus, Minus } from 'lucide-react'
import { motion } from 'motion/react'
import { SnapPager, SnapSection, ParallaxLayer } from '@/components/ui/SnapPager'
import { ThemeToggle } from '@/components/ThemeToggle'
import { getProfile, type UserProfile, goalLabels, experienceLabels } from '@/lib/profile'
import { getLifetimeStats } from '@/lib/tracker'
import { getWeekDates, isToday, formatDate, todayWeekIndex, DAY_LABELS } from '@/lib/week'
import { loadProgram, saveProgram, addExercise, removeExercise, todayDayData } from '@/lib/program-store'
import type { WorkoutProgram } from '@/lib/workout'
import { t } from '@/lib/i18n'

/* ─── BunkerPage ─────────────────────────────────────────── */

/* Bunker sayfası layout ayarı: main'in alt padding'ini -mx trick ile bypass eder.
   SnapPager tam-yükseklik konteyneri olduğu için -mb-safe-nav yerine
   style ile override ediyoruz. */
export function BunkerPage() {
  const [mounted, setMounted] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [program, setProgram] = useState<WorkoutProgram | null>(null)
  const [stats, setStats] = useState({ currentWeightKg: 0, activeDays: 0, streak: 0 })
  const [weekOffset, setWeekOffset] = useState(0)
  const snapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
    setProfile(getProfile())
    setProgram(loadProgram())
    const ls = getLifetimeStats()
    setStats({ currentWeightKg: ls.currentWeightKg, activeDays: ls.activeDays, streak: ls.currentStreak })
  }, [])

  const handleProgramChange = useCallback((updated: WorkoutProgram) => {
    saveProgram(updated)
    setProgram(updated)
  }, [])

  const scrollToSection = useCallback((index: number) => {
    const container = snapRef.current
    if (!container) return
    const sections = container.querySelectorAll('[data-snap-section]')
    sections[index]?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const todayIdx = todayWeekIndex()
  const today = todayDayData(program ?? { name: '', description: '', daysPerWeek: 3, days: [] })
  const refDate = new Date()
  refDate.setDate(refDate.getDate() + weekOffset * 7)
  const weekDates = getWeekDates(refDate)

  return (
    <SnapPager>
      {/* S1 — Hero */}
      <HeroSection
        mounted={mounted}
        profile={profile}
        stats={stats}
        onScrollToCalendar={() => scrollToSection(1)}
      />

      {/* S2 — Calendar */}
      <CalendarSection
        mounted={mounted}
        program={program}
        weekDates={weekDates}
        todayIdx={todayIdx}
        weekOffset={weekOffset}
        onPrevWeek={() => setWeekOffset((o) => o - 1)}
        onNextWeek={() => setWeekOffset((o) => o + 1)}
        onDayTap={() => scrollToSection(2)}
      />

      {/* S3 — Today's Plan */}
      <PlanSection
        mounted={mounted}
        profile={profile}
        today={today}
        program={program}
      />

      {/* S4 — Program Detail */}
      <ProgramSection
        mounted={mounted}
        program={program}
        onProgramChange={handleProgramChange}
      />
    </SnapPager>
  )
}

/* ─── S1 Hero ────────────────────────────────────────────── */

type HeroSectionProps = {
  mounted: boolean
  profile: UserProfile | null
  stats: { currentWeightKg: number; activeDays: number; streak: number }
  onScrollToCalendar: () => void
}

function HeroSection({ mounted, profile, stats }: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null)

  return (
    <SnapSection className="relative px-6 pt-6" data-snap-section="">
      {/* Header */}
      <div className="flex items-center justify-end gap-2 mb-auto absolute top-6 right-6">
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

      {/* Hero content */}
      <div className="flex flex-col justify-center flex-1 min-h-[100dvh]" ref={sectionRef as React.RefObject<HTMLDivElement>}>
        <ParallaxLayer sectionRef={sectionRef as React.RefObject<HTMLElement>} distance={40}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] mb-3" style={{ color: 'var(--muted)' }}>
            Bunker
          </p>
          <h1 className="text-6xl font-black tracking-tighter leading-none mb-4">
            {t.home.greeting}
          </h1>
          {mounted && profile && (
            <p className="text-base" style={{ color: 'var(--muted)' }}>
              {experienceLabels[profile.experience]} · {goalLabels[profile.goal]}
            </p>
          )}
        </ParallaxLayer>

        {/* Stats */}
        {mounted && (
          <div className="mt-12 flex gap-8">
            <StatItem value={stats.currentWeightKg > 0 ? `${stats.currentWeightKg}` : '—'} unit="kg" label="Weight" />
            <StatItem value={`${stats.streak}`} unit="d" label="Streak" />
            <StatItem value={`${stats.activeDays}`} unit="" label="Active days" />
          </div>
        )}

        {!mounted || !profile ? (
          <Link
            href="/profile/edit"
            className="btn-ink mt-10 inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-bold w-fit"
          >
            <UserPlus className="size-4" aria-hidden="true" />
            {t.home.createProfile}
          </Link>
        ) : null}
      </div>
    </SnapSection>
  )
}

function StatItem({ value, unit, label }: { value: string; unit: string; label: string }) {
  return (
    <div>
      <p className="text-3xl font-black tracking-tight leading-none tabular">
        {value}
        {unit && <span className="text-base font-normal ml-0.5" style={{ color: 'var(--muted)' }}>{unit}</span>}
      </p>
      <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>{label}</p>
    </div>
  )
}

/* ─── S2 Calendar ────────────────────────────────────────── */

type CalendarSectionProps = {
  mounted: boolean
  program: WorkoutProgram | null
  weekDates: Date[]
  todayIdx: number
  weekOffset: number
  onPrevWeek: () => void
  onNextWeek: () => void
  onDayTap: () => void
}

function CalendarSection({
  mounted, program, weekDates, todayIdx, weekOffset, onPrevWeek, onNextWeek, onDayTap
}: CalendarSectionProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const daysPerWeek = program?.daysPerWeek ?? 3

  return (
    <SnapSection className="px-6" data-snap-section="">
      <div className="flex-1 flex flex-col justify-center min-h-[100dvh]" ref={sectionRef as React.RefObject<HTMLDivElement>}>
        <ParallaxLayer sectionRef={sectionRef as React.RefObject<HTMLElement>} distance={30}>
          <div className="flex items-center justify-between mb-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em]" style={{ color: 'var(--muted)' }}>
              {weekOffset === 0 ? 'This week' : weekOffset < 0 ? 'Past' : 'Next'}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onPrevWeek}
                aria-label="Previous week"
                className="flex size-8 items-center justify-center rounded-full border"
                style={{ borderColor: 'var(--card-border)', color: 'var(--muted)' }}
              >
                <ChevronLeft className="size-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={onNextWeek}
                aria-label="Next week"
                className="flex size-8 items-center justify-center rounded-full border"
                style={{ borderColor: 'var(--card-border)', color: 'var(--muted)' }}
              >
                <ChevronRight className="size-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {DAY_LABELS.map((label, i) => {
              const date = weekDates[i]
              const todayFlag = mounted && isToday(date)
              const isWorkout = mounted && i < daysPerWeek
              return (
                <button
                  key={label}
                  type="button"
                  onClick={todayFlag ? onDayTap : undefined}
                  aria-label={`${label}${isWorkout ? ' workout' : ' rest'}${todayFlag ? ' today' : ''} ${formatDate(date)}`}
                  className="flex flex-col items-center gap-1.5 rounded-2xl py-3 transition-colors"
                  style={
                    todayFlag
                      ? { background: 'var(--ink)', color: 'var(--ink-text)' }
                      : {
                          background: isWorkout ? 'var(--surface-1)' : 'transparent',
                          border: isWorkout ? '1.5px solid var(--card-border)' : '1.5px solid transparent',
                          color: isWorkout ? 'var(--foreground)' : 'var(--muted)',
                        }
                  }
                >
                  <span className="text-[10px] font-medium">{label}</span>
                  <span className="text-sm font-bold tabular">{date.getDate()}</span>
                  <div
                    className="size-1.5 rounded-full"
                    style={{
                      background: isWorkout
                        ? todayFlag ? 'var(--ink-text)' : 'var(--accent)'
                        : 'transparent',
                    }}
                  />
                </button>
              )
            })}
          </div>

          <p className="mt-6 text-sm" style={{ color: 'var(--muted)' }}>
            {daysPerWeek} workout days · {7 - daysPerWeek} rest
          </p>
        </ParallaxLayer>
      </div>
    </SnapSection>
  )
}

/* ─── S3 Today's Plan ─────────────────────────────────────── */

type PlanSectionProps = {
  mounted: boolean
  profile: UserProfile | null
  today: ReturnType<typeof todayDayData>
  program: WorkoutProgram | null
}

function PlanSection({ mounted, profile, today, program }: PlanSectionProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const router = useRouter()

  if (!mounted || !profile || !program || !today) {
    return (
      <SnapSection className="px-6" data-snap-section="">
        <div className="flex-1 flex flex-col justify-center min-h-[100dvh]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] mb-4" style={{ color: 'var(--muted)' }}>
            {t.home.todaysPlan}
          </p>
          {!profile ? (
            <Link href="/profile/edit" className="btn-ink inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-bold w-fit">
              <UserPlus className="size-4" aria-hidden="true" />
              {t.home.createProfile}
            </Link>
          ) : (
            <p className="text-2xl font-black" style={{ color: 'var(--muted)' }}>No program yet</p>
          )}
        </div>
      </SnapSection>
    )
  }

  const exerciseCount = today.day.exercises.length

  return (
    <SnapSection className="px-6" data-snap-section="">
      <div className="flex-1 flex flex-col justify-center min-h-[100dvh]" ref={sectionRef as React.RefObject<HTMLDivElement>}>
        <ParallaxLayer sectionRef={sectionRef as React.RefObject<HTMLElement>} distance={35}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] mb-4" style={{ color: 'var(--muted)' }}>
            {t.home.todaysPlan}
          </p>
          <h2 className="text-5xl font-black tracking-tighter leading-none mb-2">
            {today.day.name || program.name}
          </h2>
          <p className="text-base mb-1" style={{ color: 'var(--muted)' }}>{program.name}</p>
          <p className="text-sm mb-10" style={{ color: 'var(--muted)' }}>
            {exerciseCount} exercise{exerciseCount !== 1 ? 's' : ''} · {today.day.estDuration || '~30 min'}
          </p>

          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push('/program')}
            className="btn-ink flex items-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-bold w-fit"
          >
            <Play className="size-4" style={{ fill: 'var(--ink-text)' }} aria-hidden="true" />
            {t.home.continueWorkout}
          </motion.button>
        </ParallaxLayer>
      </div>
    </SnapSection>
  )
}

/* ─── S4 Program Detail ──────────────────────────────────── */

type ProgramSectionProps = {
  mounted: boolean
  program: WorkoutProgram | null
  onProgramChange: (p: WorkoutProgram) => void
}

function ProgramSection({ mounted, program, onProgramChange }: ProgramSectionProps) {
  if (!mounted || !program) {
    return (
      <SnapSection last className="px-6" data-snap-section="">
        <div className="flex-1 flex flex-col justify-center min-h-[100dvh]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] mb-4" style={{ color: 'var(--muted)' }}>
            Program
          </p>
          <p className="text-2xl font-black" style={{ color: 'var(--muted)' }}>—</p>
        </div>
      </SnapSection>
    )
  }

  const todayIdx = todayWeekIndex() % program.daysPerWeek

  return (
    <SnapSection last className="px-6 overflow-y-auto" data-snap-section="">
      <div className="min-h-[100dvh] flex flex-col py-8">
        <div className="mb-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] mb-1" style={{ color: 'var(--muted)' }}>
            Program
          </p>
          <h2 className="text-3xl font-black tracking-tight">{program.name}</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
            {program.daysPerWeek} days/week
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {program.days.map((day, dayIdx) => {
            const isCurrentDay = dayIdx === todayIdx
            return (
              <div
                key={dayIdx}
                className="rounded-2xl p-4"
                style={{
                  background: isCurrentDay ? 'var(--surface-2)' : 'var(--surface-1)',
                  border: `1.5px solid ${isCurrentDay ? 'var(--accent)' : 'var(--card-border)'}`,
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: isCurrentDay ? 'var(--accent)' : 'var(--muted)' }}>
                      Day {dayIdx + 1}{isCurrentDay ? ' · Today' : ''}
                    </p>
                    <p className="font-bold text-base">{day.name}</p>
                  </div>
                  <span className="text-xs" style={{ color: 'var(--muted)' }}>{day.exercises.length} ex</span>
                </div>

                <div className="flex flex-col gap-1.5">
                  {day.exercises.map((ex) => (
                    <div key={ex.id} className="flex items-center justify-between gap-2">
                      <span className="text-sm truncate">{ex.name}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs tabular" style={{ color: 'var(--muted)' }}>
                          {ex.sets}×{ex.reps}
                        </span>
                        <button
                          type="button"
                          onClick={() => onProgramChange(removeExercise(program, dayIdx, ex.id))}
                          aria-label={`Remove ${ex.name}`}
                          className="flex size-6 items-center justify-center rounded-full border"
                          style={{ borderColor: 'var(--card-border)', color: 'var(--muted)' }}
                        >
                          <Minus className="size-3" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        <Link
          href="/program"
          className="btn-ink mt-6 flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold"
        >
          <Plus className="size-4" aria-hidden="true" />
          Edit Full Program
        </Link>
      </div>
    </SnapSection>
  )
}
