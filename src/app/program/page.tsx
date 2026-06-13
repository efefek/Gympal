'use client'

import { useEffect, useState, useMemo, useRef, useCallback, useId } from 'react'
import Link from 'next/link'
import {
  Dumbbell, Play, Pause, RotateCcw, Check,
  ChevronLeft, ChevronRight, X, Pencil, Plus, Trash2,
  ArrowLeft, SkipForward, Flame,
} from 'lucide-react'
import { getProfile, goalLabels } from '@/lib/profile'
import { generateProgram, type WorkoutProgram, type WorkoutExercise } from '@/lib/workout'
import { getExercises, type Exercise } from '@/lib/musclewiki'
import ExerciseMedia from '@/components/ExerciseMedia'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const STORAGE_KEY = 'gympal-program-custom'

/* ─── Utilities ─────────────────────────────────────────── */

function getWeekDates(ref: Date): Date[] {
  const start = new Date(ref)
  const day = start.getDay()
  const diff = start.getDate() - day + (day === 0 ? -6 : 1)
  start.setDate(diff)
  start.setHours(0, 0, 0, 0)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return d
  })
}

function isToday(d: Date): boolean {
  const t = new Date()
  return d.toDateString() === t.toDateString()
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

/* ─── useTimer hook ─────────────────────────────────────── */

function useTimer(initialSeconds: number) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds)
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  const start = useCallback(() => {
    if (done) return
    setRunning(true)
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!)
          setRunning(false)
          setDone(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [done])

  const pause = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setRunning(false)
  }, [])

  const reset = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setRunning(false)
    setDone(false)
    setTimeLeft(initialSeconds)
  }, [initialSeconds])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  return { timeLeft, running, done, display, start, pause, reset, setTimeLeft }
}

/* ─── GifModal (bottom sheet) ───────────────────────────── */

function GifModal({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    closeRef.current?.focus()
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 animate-fade-in sm:items-center sm:p-4">
      <button type="button" aria-label="Close image" tabIndex={-1} onClick={onClose} className="absolute inset-0 cursor-default" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={alt}
        className="relative w-full max-w-lg rounded-t-[1.75rem] border border-zinc-800 bg-surface-1 p-4 pb-8 animate-slide-up sm:rounded-[1.75rem] sm:pb-4"
      >
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-zinc-700 sm:hidden" aria-hidden="true" />
        <div className="mb-3 flex items-center justify-between">
          <h2 className="truncate pr-2 text-sm font-semibold">{alt}</h2>
          <button
            ref={closeRef}
            type="button"
            aria-label="Close image"
            onClick={onClose}
            className="tap-scale flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-3 text-zinc-400 transition-colors hover:text-white"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
        <img src={src} alt={alt} className="w-full rounded-2xl bg-surface-2" />
      </div>
    </div>
  )
}

/* ─── SetTimer ───────────────────────────────────────────── */

function SetTimer({ restSeconds, onComplete }: { restSeconds: number; onComplete: () => void }) {
  const timer = useTimer(restSeconds)

  useEffect(() => {
    if (timer.done) onComplete()
  }, [timer.done, onComplete])

  return (
    <div className="flex items-center gap-2">
      <span className="min-w-[56px] font-mono text-lg font-bold tabular-nums">{timer.display}</span>
      {!timer.running && !timer.done && (
        <button type="button" aria-label="Start rest timer" onClick={timer.start}
          className="tap-scale flex size-9 items-center justify-center rounded-xl bg-primary text-black transition-colors hover:bg-primary-dark">
          <Play className="size-4 fill-black" aria-hidden="true" />
        </button>
      )}
      {timer.running && (
        <button type="button" aria-label="Pause timer" onClick={timer.pause}
          className="tap-scale flex size-9 items-center justify-center rounded-xl bg-zinc-700 text-white transition-colors hover:bg-zinc-600">
          <Pause className="size-4" aria-hidden="true" />
        </button>
      )}
      {timer.done && (
        <span className="flex items-center gap-1 text-xs font-semibold text-primary">
          <Check className="size-4" aria-hidden="true" />
          <span className="sr-only">Rest done</span>
        </span>
      )}
      <button type="button" aria-label="Reset timer" onClick={timer.reset}
        className="tap-scale flex size-9 items-center justify-center rounded-xl text-zinc-500 transition-colors hover:text-zinc-300">
        <RotateCcw className="size-4" aria-hidden="true" />
      </button>
    </div>
  )
}

/* ─── ExerciseRow (numbered list item, list view) ────────── */

function ExerciseRow({
  exercise,
  index,
  onEdit,
  onRemove,
  onShowGif,
}: {
  exercise: WorkoutExercise
  index: number
  onEdit: (updates: Partial<WorkoutExercise>) => void
  onRemove: () => void
  onShowGif: () => void
}) {
  const uid = useId()
  const [editing, setEditing] = useState(false)
  const [editSets, setEditSets] = useState(exercise.sets)
  const [editReps, setEditReps] = useState(exercise.reps)

  function saveEdit() {
    onEdit({ sets: editSets, reps: editReps })
    setEditing(false)
  }

  return (
    <div className="border-b border-zinc-800/50 last:border-0">
      <div className="flex items-center gap-4 py-4">
        {/* Number badge */}
        <button
          type="button"
          aria-label={`View ${exercise.name} demo`}
          onClick={onShowGif}
          className="tap-scale flex size-10 shrink-0 items-center justify-center rounded-xl overflow-hidden bg-surface-2 hover:ring-2 hover:ring-primary/40 transition-all"
        >
          <ExerciseMedia slug={exercise.slug} gifUrl={exercise.gifUrl} alt={exercise.name} className="size-full object-contain" />
        </button>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-foreground truncate">
            <span className="text-zinc-500 font-mono mr-1.5">{String(index + 1).padStart(2, '0')}</span>
            {exercise.name}
          </p>
          {!editing ? (
            <p className="text-xs text-zinc-500 mt-0.5">
              {exercise.sets} sets · {exercise.reps} · {exercise.rest} rest
            </p>
          ) : (
            <div className="flex items-center gap-2 mt-1.5">
              <div className="flex items-center gap-1">
                <label htmlFor={`${uid}-sets`} className="text-[11px] text-zinc-500">Sets</label>
                <input id={`${uid}-sets`} type="number" value={editSets}
                  onChange={(e) => setEditSets(Math.max(1, Number(e.target.value)))}
                  className="w-10 rounded border border-zinc-700 bg-zinc-800 px-1 py-0.5 text-xs text-center outline-none focus:border-primary/50" />
              </div>
              <div className="flex items-center gap-1">
                <label htmlFor={`${uid}-reps`} className="text-[11px] text-zinc-500">Reps</label>
                <input id={`${uid}-reps`} value={editReps}
                  onChange={(e) => setEditReps(e.target.value)}
                  className="w-12 rounded border border-zinc-700 bg-zinc-800 px-1 py-0.5 text-xs text-center outline-none focus:border-primary/50" />
              </div>
              <button type="button" onClick={saveEdit}
                className="rounded bg-primary text-black px-2 py-0.5 text-[11px] font-semibold hover:bg-primary-dark transition-all">
                Save
              </button>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button type="button" aria-label="Edit exercise" aria-expanded={editing}
            onClick={() => setEditing(!editing)}
            className="flex size-8 items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-zinc-800 hover:text-zinc-300">
            <Pencil className="size-3.5" aria-hidden="true" />
          </button>
          <button type="button" aria-label={`Remove ${exercise.name}`}
            onClick={onRemove}
            className="flex size-8 items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-zinc-800 hover:text-red-400">
            <Trash2 className="size-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── ActiveWorkoutView (full-screen, one exercise at a time) */

function ActiveWorkoutView({
  exercises,
  onFinish,
}: {
  exercises: WorkoutExercise[]
  onFinish: () => void
}) {
  const [exIdx, setExIdx] = useState(0)
  const [setIdx, setSetIdx] = useState(0)
  const [gifOpen, setGifOpen] = useState(false)
  const [completedSets, setCompletedSets] = useState<boolean[][]>(
    exercises.map((ex) => Array(ex.sets).fill(false))
  )

  const exercise = exercises[exIdx]
  if (!exercise) return null

  const totalSets = exercise.sets
  const currentCompleted = completedSets[exIdx]
  const allSetsForExDone = currentCompleted.every(Boolean)

  function markSetDone() {
    setCompletedSets((prev) => {
      const next = prev.map((row) => [...row])
      next[exIdx][setIdx] = true
      return next
    })
    if (setIdx < totalSets - 1) {
      setSetIdx(setIdx + 1)
    }
  }

  function goNextExercise() {
    if (exIdx < exercises.length - 1) {
      setExIdx(exIdx + 1)
      setSetIdx(0)
    } else {
      onFinish()
    }
  }

  return (
    <>
      {gifOpen && <GifModal src={exercise.gifUrl} alt={exercise.name} onClose={() => setGifOpen(false)} />}

      <div className="fixed inset-0 z-40 flex flex-col bg-black px-5 pb-8 pt-4">

        {/* Top bar */}
        <div className="flex items-center justify-between mb-2">
          <button type="button" aria-label="Back to program" onClick={onFinish}
            className="tap-scale flex size-10 items-center justify-center rounded-full bg-surface-2 text-zinc-400 transition-colors hover:text-white">
            <ArrowLeft className="size-5" aria-hidden="true" />
          </button>
          <div className="flex flex-col items-center">
            <p className="text-sm font-semibold text-foreground truncate max-w-[180px]">{exercise.name}</p>
            <div className="flex items-center gap-1 mt-1">
              {exercises.map((_, i) => (
                <div key={i} className={`h-1 rounded-full transition-all ${
                  i < exIdx ? 'w-4 bg-primary' : i === exIdx ? 'w-4 bg-primary' : 'w-2 bg-zinc-700'
                }`} />
              ))}
            </div>
          </div>
          <button type="button" aria-label="Skip to next exercise" onClick={goNextExercise}
            className="tap-scale flex size-10 items-center justify-center rounded-full bg-surface-2 text-zinc-400 transition-colors hover:text-white">
            <SkipForward className="size-5" aria-hidden="true" />
          </button>
        </div>

        <p className="text-center text-xs text-zinc-500 mb-6">
          Exercise {exIdx + 1} / {exercises.length} · Set {setIdx + 1} / {totalSets}
        </p>

        {/* GIF */}
        <div className="flex justify-center mb-6">
          <button
            type="button"
            aria-label={`View ${exercise.name} demo`}
            onClick={() => setGifOpen(true)}
            className="tap-scale w-44 h-44 rounded-3xl overflow-hidden bg-surface-2 hover:ring-2 hover:ring-primary/40 transition-all"
          >
            <ExerciseMedia slug={exercise.slug} gifUrl={exercise.gifUrl} alt={exercise.name} className="size-full object-contain" />
          </button>
        </div>

        {/* Reps / metric — large display */}
        <div className="flex flex-col items-center mb-8">
          <span
            className="font-black text-primary leading-none"
            style={{ fontSize: 'clamp(4rem, 15vw, 5.5rem)' }}
          >
            {exercise.reps}
          </span>
          <span className="text-xs tracking-[0.2em] text-zinc-500 mt-1 uppercase">
            {exercise.reps.match(/\d/) ? 'Reps' : 'Duration'}
          </span>
        </div>

        {/* Set indicators */}
        <div className="flex justify-center gap-2 mb-6">
          {Array.from({ length: totalSets }).map((_, i) => (
            <div
              key={i}
              className={`flex size-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                currentCompleted[i]
                  ? 'bg-primary text-black'
                  : i === setIdx
                  ? 'border-2 border-primary text-primary'
                  : 'bg-surface-2 text-zinc-500'
              }`}
            >
              {currentCompleted[i] ? <Check className="size-4" /> : i + 1}
            </div>
          ))}
        </div>

        {/* Rest timer */}
        {setIdx > 0 || currentCompleted[0] ? (
          <div className="flex justify-center mb-4">
            <SetTimer
              key={`${exIdx}-${setIdx}`}
              restSeconds={parseInt(exercise.rest) || 60}
              onComplete={() => {}}
            />
          </div>
        ) : null}

        {/* Controls */}
        <div className="mt-auto flex flex-col gap-3">
          {!allSetsForExDone ? (
            <button
              type="button"
              onClick={markSetDone}
              className="tap-scale w-full rounded-2xl bg-primary py-4 text-sm font-bold text-black"
            >
              Done Set {setIdx + 1}
            </button>
          ) : (
            <button
              type="button"
              onClick={goNextExercise}
              className="tap-scale w-full rounded-2xl bg-primary py-4 text-sm font-bold text-black"
            >
              {exIdx < exercises.length - 1 ? 'Next Exercise →' : 'Finish Workout'}
            </button>
          )}
          <button
            type="button"
            onClick={onFinish}
            className="tap-scale w-full rounded-2xl bg-surface-2 py-3.5 text-sm font-medium text-zinc-400 border border-zinc-800"
          >
            End Workout
          </button>
        </div>
      </div>
    </>
  )
}

/* ─── ProgramPage (main) ─────────────────────────────────── */

export default function ProgramPage() {
  const [program, setProgram] = useState<WorkoutProgram | null>(null)
  const [allExercises, setAllExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [weekOffset, setWeekOffset] = useState(0)
  const [selectedDay, setSelectedDay] = useState(0)
  const [addingExercise, setAddingExercise] = useState(false)
  const [addSearch, setAddSearch] = useState('')
  const [hasCustom, setHasCustom] = useState(false)
  const [isActive, setIsActive] = useState(false)
  const [gifModal, setGifModal] = useState<{ src: string; alt: string } | null>(null)

  const profile = useMemo(() => getProfile(), [])

  useEffect(() => {
    const p = getProfile()
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time client-only profile check after mount
    if (!p) { setLoading(false); return }

    getExercises({ limit: 500 })
      .then((data) => {
        const pool = (data.exercises as Exercise[]).filter((e) => {
          if (p.location === 'gym') return true
          return ['bodyweight', 'band'].includes(e.equipment)
        })

        const customRaw = localStorage.getItem(STORAGE_KEY)
        if (customRaw) {
          try {
            const custom = JSON.parse(customRaw) as WorkoutProgram
            setProgram(custom)
            setAllExercises(pool)
            setHasCustom(true)
            setLoading(false)
            return
          } catch {}
        }

        const gen = generateProgram(p, pool)
        setProgram(gen)
        setAllExercises(pool)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  function saveCustom(updated: WorkoutProgram) {
    setProgram(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    setHasCustom(true)
  }

  function handleEditExercise(dayIdx: number, exIdx: number, updates: Partial<WorkoutExercise>) {
    if (!program) return
    const updated = { ...program }
    updated.days[dayIdx].exercises = [...updated.days[dayIdx].exercises]
    updated.days[dayIdx].exercises[exIdx] = { ...updated.days[dayIdx].exercises[exIdx], ...updates }
    saveCustom(updated)
  }

  function handleRemoveExercise(dayIdx: number, exIdx: number) {
    if (!program) return
    const updated = { ...program }
    updated.days[dayIdx].exercises = updated.days[dayIdx].exercises.filter((_, i) => i !== exIdx)
    saveCustom(updated)
  }

  function handleAddExercise(dayIdx: number, exercise: Exercise) {
    if (!program) return
    const updated = { ...program }
    const newEx: WorkoutExercise = {
      ...exercise,
      sets: 3,
      reps: '10-12',
      rest: '60s',
      order: updated.days[dayIdx].exercises.length + 1,
    }
    updated.days[dayIdx].exercises = [...updated.days[dayIdx].exercises, newEx]
    saveCustom(updated)
    setAddingExercise(false)
    setAddSearch('')
  }

  const today = useMemo(() => new Date(), [])
  const weekDates = useMemo(() => {
    const ref = new Date(today)
    ref.setDate(today.getDate() + weekOffset * 7)
    return getWeekDates(ref)
  }, [weekOffset, today])

  /* ── Loading / no profile states ── */
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-zinc-500">
          <div className="size-10 rounded-xl border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm">Loading your program...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-surface-2 text-zinc-500 mb-6">
          <Dumbbell className="size-8" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold mb-2">No Profile Yet</h1>
        <p className="text-zinc-500 mb-6 text-sm">Create your profile to get a personalised workout program.</p>
        <Link href="/profile" className="inline-flex items-center gap-2 rounded-xl bg-primary text-black font-semibold px-6 py-3 hover:bg-primary-dark transition-all">
          Create Profile
        </Link>
      </div>
    )
  }

  if (!program) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <p className="text-zinc-500 text-sm">Could not generate program. Try again later.</p>
      </div>
    )
  }

  const currentDay = weekDates[selectedDay]
  const dayHasWorkout = selectedDay < program.daysPerWeek
  const selectedWorkoutDay = dayHasWorkout ? program.days[selectedDay] : null

  const addCandidates = addSearch.trim()
    ? allExercises
        .filter((e) =>
          e.name.toLowerCase().includes(addSearch.toLowerCase()) &&
          !program.days[selectedDay].exercises.some((ex) => ex.id === e.id)
        )
        .slice(0, 10)
    : []

  /* ── Active workout view ── */
  if (isActive && selectedWorkoutDay && selectedWorkoutDay.exercises.length > 0) {
    return (
      <ActiveWorkoutView
        exercises={selectedWorkoutDay.exercises}
        onFinish={() => setIsActive(false)}
      />
    )
  }

  /* ── Program list view ── */
  const totalSets = selectedWorkoutDay?.exercises.reduce((a, e) => a + e.sets, 0) ?? 0
  const estMinutes = selectedWorkoutDay ? selectedWorkoutDay.exercises.length * 4 + totalSets * 1 : 0

  return (
    <>
      {gifModal && <GifModal src={gifModal.src} alt={gifModal.alt} onClose={() => setGifModal(null)} />}

      <div className="flex-1 px-4 py-6 pb-32">
        <div className="max-w-3xl mx-auto">

          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold truncate">{program.name}</h1>
              <p className="text-sm text-zinc-500 mt-0.5">{program.description}</p>
            </div>
            <div className="flex items-center gap-1.5 ml-3 shrink-0 rounded-xl bg-primary-dim px-3 py-1.5 text-xs font-medium text-primary">
              <Dumbbell className="size-3.5" aria-hidden="true" />
              {program.daysPerWeek}d/w · {goalLabels[profile.goal]}
            </div>
          </div>

          {/* Day selector */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-3 mb-6 mt-5">
            <div className="flex items-center justify-between mb-2">
              <button type="button" aria-label="Previous week" onClick={() => setWeekOffset((w) => w - 1)}
                className="p-1 text-zinc-500 hover:text-zinc-300 transition-colors">
                <ChevronLeft className="size-4" aria-hidden="true" />
              </button>
              <span className="text-sm font-medium text-zinc-400">
                {formatDate(weekDates[0])} — {formatDate(weekDates[6])}
              </span>
              <button type="button" aria-label="Next week" onClick={() => setWeekOffset((w) => w + 1)}
                className="p-1 text-zinc-500 hover:text-zinc-300 transition-colors">
                <ChevronRight className="size-4" aria-hidden="true" />
              </button>
            </div>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1">
              {weekDates.map((date, i) => {
                const hasWorkout = i < program.daysPerWeek
                const isSelected = selectedDay === i
                const isTodayDay = isToday(date)
                const dayLabel = date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
                return (
                  <button
                    key={i}
                    type="button"
                    aria-label={`${dayLabel}, ${hasWorkout ? 'workout' : 'rest day'}`}
                    aria-pressed={isSelected}
                    aria-current={isTodayDay ? 'date' : undefined}
                    onClick={() => setSelectedDay(i)}
                    className={`tap-scale flex min-w-[3.25rem] flex-1 flex-col items-center gap-1 rounded-2xl py-3 text-xs font-medium transition-colors ${
                      isSelected
                        ? 'bg-primary text-black'
                        : hasWorkout
                        ? 'bg-surface-3 text-zinc-300 hover:bg-zinc-700'
                        : 'bg-surface-2/50 text-zinc-600 hover:text-zinc-400'
                    }`}
                  >
                    <span className="text-[11px] opacity-60">{DAYS[i]}</span>
                    <span className={`text-base font-bold ${isTodayDay && !isSelected ? 'text-primary' : ''}`}>
                      {date.getDate()}
                    </span>
                    <div className={`size-1.5 rounded-full ${
                      hasWorkout ? (isSelected ? 'bg-black/40' : 'bg-primary') : 'bg-transparent'
                    }`} />
                  </button>
                )
              })}
            </div>
          </div>

          {/* Workout day view */}
          {dayHasWorkout && selectedWorkoutDay ? (
            <>
              {/* Day header with stats */}
              <div className="mb-4">
                <h2 className="text-lg font-bold">Day {selectedDay + 1}: {selectedWorkoutDay.name}</h2>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="inline-flex items-center gap-1 rounded-full bg-surface-2 border border-zinc-800 px-3 py-1 text-xs text-zinc-400">
                    {selectedWorkoutDay.exercises.length} exercises
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-surface-2 border border-zinc-800 px-3 py-1 text-xs text-zinc-400">
                    ~{estMinutes} min
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-surface-2 border border-zinc-800 px-3 py-1 text-xs text-zinc-400">
                    <Flame className="size-3 text-primary" aria-hidden="true" />
                    {totalSets} sets
                  </span>
                </div>
              </div>

              {/* Exercise list — numbered rows */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-zinc-300">Exercise List</span>
                  <button type="button" onClick={() => setAddingExercise(true)}
                    className="flex items-center gap-1 text-xs text-primary hover:underline transition-colors">
                    <Plus className="size-3.5" aria-hidden="true" />
                    Add
                  </button>
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-surface-1 px-4">
                  {selectedWorkoutDay.exercises.map((ex, i) => (
                    <ExerciseRow
                      key={`${ex.id}-${i}`}
                      exercise={ex}
                      index={i}
                      onEdit={(updates) => handleEditExercise(selectedDay, i, updates)}
                      onRemove={() => handleRemoveExercise(selectedDay, i)}
                      onShowGif={() => setGifModal({ src: ex.gifUrl, alt: ex.name })}
                    />
                  ))}
                </div>
              </div>

              {/* Add exercise search */}
              {addingExercise && (
                <div className="rounded-xl border border-zinc-800 bg-surface-1 p-3 mb-4">
                  <div className="relative">
                    <label htmlFor="add-exercise-search" className="sr-only">Search exercises to add</label>
                    <input
                      id="add-exercise-search"
                      type="text"
                      placeholder="Search exercises to add..."
                      value={addSearch}
                      onChange={(e) => setAddSearch(e.target.value)}
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-foreground placeholder-zinc-500 outline-none focus:border-primary/50"
                      ref={(el) => el?.focus()}
                    />
                    <button type="button" aria-label="Close exercise search"
                      onClick={() => { setAddingExercise(false); setAddSearch('') }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
                      <X className="size-4" aria-hidden="true" />
                    </button>
                  </div>
                  {addCandidates.length > 0 && (
                    <div className="mt-2 max-h-48 overflow-y-auto space-y-1">
                      {addCandidates.map((ex) => (
                        <button key={ex.id} type="button" onClick={() => handleAddExercise(selectedDay, ex)}
                          className="w-full flex items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-800 transition-all">
                          <img src={ex.gifUrl} alt={ex.name} className="size-8 rounded bg-zinc-800 object-contain" />
                          <div className="min-w-0">
                            <div className="font-medium truncate">{ex.name}</div>
                            <div className="text-[11px] text-zinc-500 capitalize">{ex.muscle} · {ex.equipment}</div>
                          </div>
                          <Plus className="size-4 shrink-0 text-primary ml-auto" aria-hidden="true" />
                        </button>
                      ))}
                    </div>
                  )}
                  {addSearch.trim() && addCandidates.length === 0 && (
                    <p className="text-xs text-zinc-600 mt-2 text-center">No exercises found</p>
                  )}
                </div>
              )}

              {/* Footer links */}
              <div className="flex justify-center gap-4 mt-6 flex-wrap">
                <Link href="/profile"
                  className="flex items-center gap-1.5 rounded-xl border border-zinc-800 px-4 py-2 text-xs font-medium text-zinc-500 transition-all hover:text-zinc-300">
                  <RotateCcw className="size-3" aria-hidden="true" />
                  Regenerate from Profile
                </Link>
                {hasCustom && (
                  <button type="button"
                    onClick={() => { localStorage.removeItem(STORAGE_KEY); setHasCustom(false); window.location.reload() }}
                    className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
                    Reset to default
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
              <div className="size-12 rounded-xl bg-surface-2 flex items-center justify-center mb-4">
                <Dumbbell className="size-5 opacity-30" />
              </div>
              <p className="text-sm font-medium">Rest Day</p>
              <p className="text-xs text-zinc-600 mt-1">{formatDate(currentDay)} — recover well.</p>
            </div>
          )}
        </div>
      </div>

      {/* Sticky Start Workout CTA */}
      {dayHasWorkout && selectedWorkoutDay && selectedWorkoutDay.exercises.length > 0 && (
        <div className="fixed inset-x-0 bottom-[5.5rem] px-5 z-30">
          <button
            type="button"
            onClick={() => setIsActive(true)}
            className="tap-scale w-full rounded-2xl bg-primary py-4 text-sm font-bold text-black shadow-[0_0_30px_rgba(57,255,20,0.3)]"
          >
            <Play className="size-4 fill-black inline mr-2" aria-hidden="true" />
            Start Workout
          </button>
        </div>
      )}
    </>
  )
}
