/* ─── Program Store ─────────────────────────────────────────
   Custom program'ı MMKV'den yükle/kaydet ve egzersiz
   operasyonları. Bunker + program ekranı paylaşır (DRY). */

import { mmkv } from './storage'
import type { WorkoutProgram, WorkoutExercise, WorkoutDay } from './workout'

export const PROGRAM_KEY = 'gympal-program-custom'

/* ── Okuma ─────────────────────────────────────────────────── */

export function loadProgram(): WorkoutProgram | null {
  try {
    const raw = mmkv.getString(PROGRAM_KEY)
    if (!raw) return null
    return JSON.parse(raw) as WorkoutProgram
  } catch {
    return null
  }
}

/* ── Yazma ─────────────────────────────────────────────────── */

export function saveProgram(program: WorkoutProgram): void {
  mmkv.set(PROGRAM_KEY, JSON.stringify(program))
}

export function clearProgram(): void {
  mmkv.delete(PROGRAM_KEY)
}

/* ── Egzersiz operasyonları ─────────────────────────────────── */

export function addExercise(
  program: WorkoutProgram,
  dayIndex: number,
  exercise: WorkoutExercise,
): WorkoutProgram {
  const days = program.days.map((day, i) => {
    if (i !== dayIndex) return day
    return { ...day, exercises: [...day.exercises, exercise] }
  })
  return { ...program, days }
}

export function removeExercise(
  program: WorkoutProgram,
  dayIndex: number,
  exerciseId: string,
): WorkoutProgram {
  const days = program.days.map((day, i) => {
    if (i !== dayIndex) return day
    return { ...day, exercises: day.exercises.filter((e) => e.id !== exerciseId) }
  })
  return { ...program, days }
}

export function updateExercise(
  program: WorkoutProgram,
  dayIndex: number,
  exerciseId: string,
  patch: Partial<Pick<WorkoutExercise, 'sets' | 'reps' | 'rest'>>,
): WorkoutProgram {
  const days = program.days.map((day, i) => {
    if (i !== dayIndex) return day
    const exercises = day.exercises.map((e) =>
      e.id === exerciseId ? { ...e, ...patch } : e,
    )
    return { ...day, exercises }
  })
  return { ...program, days }
}

export function updateDayName(
  program: WorkoutProgram,
  dayIndex: number,
  name: string,
): WorkoutProgram {
  const days = program.days.map((day, i) =>
    i === dayIndex ? { ...day, name } : day,
  )
  return { ...program, days }
}

/* ── Bugünün günü ───────────────────────────────────────────── */

/** Program'daki bugüne karşılık gelen günü döner (index ile). */
export function todayDayData(program: WorkoutProgram): { day: WorkoutDay; index: number } | null {
  if (!program.days.length) return null
  const todayDayOfWeek = new Date().getDay()
  const todayIdx = todayDayOfWeek === 0 ? 6 : todayDayOfWeek - 1
  const index = todayIdx % program.daysPerWeek
  const day = program.days[index]
  if (!day) return null
  return { day, index }
}
