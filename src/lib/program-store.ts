/* ─── Program Store ─────────────────────────────────────────
   Custom program'ı localStorage'dan yükle/kaydet ve egzersiz
   operasyonları. Bunker + program/page.tsx paylaşır (DRY). */

import type { WorkoutProgram, WorkoutExercise, WorkoutDay } from './workout'

export const PROGRAM_KEY = 'gympal-program-custom'

/* ── Okuma ─────────────────────────────────────────────────── */

export function loadProgram(): WorkoutProgram | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(PROGRAM_KEY)
    if (!raw) return null
    return JSON.parse(raw) as WorkoutProgram
  } catch {
    return null
  }
}

/* ── Yazma ─────────────────────────────────────────────────── */

export function saveProgram(program: WorkoutProgram): void {
  localStorage.setItem(PROGRAM_KEY, JSON.stringify(program))
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
