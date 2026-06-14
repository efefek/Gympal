/**
 * Ready-made workout programs built from the local exercise pool.
 * Each builder picks bodyweight (no-equipment) exercises by muscle so presets
 * work for everyone regardless of profile. Returns a WorkoutProgram, the same
 * shape generateProgram produces, so it drops straight into the program page.
 */
import type { Exercise } from '@/lib/musclewiki'
import type { WorkoutProgram, WorkoutExercise, WorkoutDay } from '@/lib/workout'

export interface PresetMeta {
  id: string
  name: string
  description: string
  tag: string
  durationLabel: string
}

export const PRESETS: PresetMeta[] = [
  { id: 'home', name: 'Home Workout', description: 'No equipment, full body', tag: 'Bodyweight', durationLabel: '~30 min' },
  { id: 'seven', name: '7-Minute Workout', description: 'Classic high-intensity circuit', tag: 'HIIT', durationLabel: '7 min' },
  { id: 'office', name: 'Office Break', description: 'Desk-friendly stretch & mobility', tag: 'Mobility', durationLabel: '~10 min' },
]

function pickByMuscle(pool: Exercise[], muscles: string[], count: number, used: Set<string>): Exercise[] {
  const picked: Exercise[] = []
  for (const muscle of muscles) {
    const match = pool.find((e) => e.muscle === muscle && !used.has(e.id))
    if (match) {
      picked.push(match)
      used.add(match.id)
    }
    if (picked.length >= count) break
  }
  // Top up from any remaining bodyweight exercise if a muscle had no match.
  for (const e of pool) {
    if (picked.length >= count) break
    if (!used.has(e.id)) {
      picked.push(e)
      used.add(e.id)
    }
  }
  return picked
}

function toWorkoutExercises(
  exercises: Exercise[],
  sets: number,
  reps: string,
  rest: string
): WorkoutExercise[] {
  return exercises.map((e, i) => ({ ...e, sets, reps, rest, order: i + 1 }))
}

function bodyweightPool(allExercises: Exercise[]): Exercise[] {
  return allExercises.filter((e) => e.equipment === 'bodyweight')
}

function buildHome(pool: Exercise[]): WorkoutProgram {
  const used = new Set<string>()
  const dayDefs: { name: string; focus: string; muscles: string[] }[] = [
    { name: 'Upper Body', focus: 'Push & pull', muscles: ['pectorals', 'triceps', 'lats', 'biceps', 'delts', 'upper-back'] },
    { name: 'Lower Body', focus: 'Legs & glutes', muscles: ['quads', 'glutes', 'hamstrings', 'calves', 'adductors', 'abductors'] },
    { name: 'Core & Cardio', focus: 'Abs & conditioning', muscles: ['abs', 'spine', 'cardio', 'serratus-anterior', 'forearms', 'traps'] },
  ]
  const days: WorkoutDay[] = dayDefs.map((d) => {
    const exercises = toWorkoutExercises(pickByMuscle(pool, d.muscles, 6, used), 3, '12-15', '45s')
    return { name: d.name, focus: d.focus, exercises, estDuration: `${exercises.length * 5} min` }
  })
  return { name: 'Home Workout', description: 'No equipment, full body', daysPerWeek: 3, days }
}

function buildSevenMinute(pool: Exercise[]): WorkoutProgram {
  const used = new Set<string>()
  const muscles = ['abs', 'quads', 'pectorals', 'glutes', 'spine', 'triceps', 'hamstrings', 'lats', 'calves', 'biceps', 'delts', 'upper-back']
  const exercises = toWorkoutExercises(pickByMuscle(pool, muscles, 12, used), 1, '30s', '10s')
  const day: WorkoutDay = { name: 'The 7', focus: 'Full body circuit', exercises, estDuration: '7 min' }
  return { name: '7-Minute Workout', description: 'Classic high-intensity circuit', daysPerWeek: 1, days: [day] }
}

function buildOffice(pool: Exercise[]): WorkoutProgram {
  const used = new Set<string>()
  const muscles = ['spine', 'upper-back', 'traps', 'forearms', 'calves']
  const exercises = toWorkoutExercises(pickByMuscle(pool, muscles, 5, used), 1, '30-45s hold', '15s')
  const day: WorkoutDay = { name: 'Desk Reset', focus: 'Stretch & mobility', exercises, estDuration: '10 min' }
  return { name: 'Office Break', description: 'Desk-friendly stretch & mobility', daysPerWeek: 1, days: [day] }
}

/** Builds a preset program from the full exercise list. Returns null for unknown ids. */
export function buildPreset(id: string, allExercises: Exercise[]): WorkoutProgram | null {
  const pool = bodyweightPool(allExercises)
  switch (id) {
    case 'home':
      return buildHome(pool)
    case 'seven':
      return buildSevenMinute(pool)
    case 'office':
      return buildOffice(pool)
    default:
      return null
  }
}
