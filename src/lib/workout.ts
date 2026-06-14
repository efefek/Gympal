import type { Exercise } from './musclewiki'
import type { UserProfile, Goal } from './profile'

export interface WorkoutExercise extends Exercise {
  sets: number
  reps: string
  rest: string
  order: number
}

export interface WorkoutDay {
  name: string
  focus: string
  exercises: WorkoutExercise[]
  estDuration: string
}

export interface WorkoutProgram {
  name: string
  description: string
  daysPerWeek: number
  days: WorkoutDay[]
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function pick<T>(arr: T[], count: number): T[] {
  return shuffle(arr).slice(0, count)
}

const goalPrograms: Record<Goal, { name: string; desc: string }> = {
  build_muscle: { name: 'Muscle Builder', desc: 'Progressive overload program for muscle growth' },
  lose_weight: { name: 'Fat Burner', desc: 'High-intensity circuit program for maximum calorie burn' },
  general_fitness: { name: 'Full Fitness', desc: 'Balanced full-body program for overall health' },
  flexibility: { name: 'Flexibility & Mobility', desc: 'Daily stretching and mobility routine' },
  endurance: { name: 'Endurance Engine', desc: 'Build stamina and cardiovascular fitness' },
}

const bodyParts = ['chest', 'back', 'shoulders', 'legs', 'arms', 'core']

const muscleToBodyPart: Record<string, string> = {
  chest: 'chest', back: 'back', shoulders: 'shoulders',
  biceps: 'arms', triceps: 'arms', forearms: 'arms',
  quadriceps: 'legs', hamstrings: 'legs', glutes: 'legs', calves: 'legs',
  abdominals: 'core', abs: 'core', obliques: 'core',
  lower_back: 'back', middle_back: 'back', neck: 'shoulders', traps: 'shoulders',
}

function bodyPartForExercise(e: Exercise): string {
  const primary = muscleToBodyPart[e.muscle.toLowerCase()] || 'other'
  return primary
}

function selectExercises(
  pool: Exercise[],
  count: number,
  preferredBodyParts: string[],
  excludeIds: Set<string> = new Set()
): WorkoutExercise[] {
  const available = pool.filter((e) => !excludeIds.has(e.id))
  const preferred = available.filter((e) => preferredBodyParts.includes(bodyPartForExercise(e)))
  const others = available.filter((e) => !preferredBodyParts.includes(bodyPartForExercise(e)))

  const selected = [
    ...pick(preferred, Math.min(count, preferred.length)),
    ...pick(others, Math.max(0, count - preferred.length)),
  ].slice(0, count)

  return selected.map((e, i) => ({
    ...e,
    sets: 3,
    reps: '10-12',
    rest: '60s',
    order: i + 1,
  }))
}

function assignSetsReps(
  exercises: WorkoutExercise[],
  goal: Goal,
  experience: string
): WorkoutExercise[] {
  return exercises.map((e) => {
    let sets = 3
    let reps = '10-12'
    let rest = '60s'

    if (goal === 'build_muscle') {
      sets = experience === 'beginner' ? 3 : experience === 'intermediate' ? 4 : 5
      reps = '8-12'
      rest = '90s'
    } else if (goal === 'lose_weight') {
      sets = 3
      reps = '12-15'
      rest = '30s'
    } else if (goal === 'endurance') {
      sets = 2
      reps = '15-20'
      rest = '30s'
    } else if (goal === 'flexibility') {
      sets = 1
      reps = '30-60s hold'
      rest = '15s'
    }

    return { ...e, sets, reps, rest }
  })
}

export function generateProgram(
  profile: UserProfile,
  exercisePool: Exercise[]
): WorkoutProgram {
  const { goal, experience, equipment, location } = profile
  const prog = goalPrograms[goal]

  const isGym = location === 'gym'
  const daysPerWeek = experience === 'beginner' ? 3 : experience === 'intermediate' ? 4 : 5

  let dayConfigs: { name: string; focus: string; bodyParts: string[] }[] = []

  if (goal === 'build_muscle') {
    if (daysPerWeek <= 3) {
      dayConfigs = [
        { name: 'Full Body A', focus: 'Strength', bodyParts: ['chest', 'back', 'legs', 'core'] },
        { name: 'Full Body B', focus: 'Power', bodyParts: ['shoulders', 'arms', 'legs', 'core'] },
        { name: 'Full Body C', focus: 'Endurance', bodyParts: ['chest', 'back', 'shoulders', 'legs'] },
      ]
    } else if (daysPerWeek === 4) {
      dayConfigs = [
        { name: 'Upper Body', focus: 'Push & Pull', bodyParts: ['chest', 'back', 'shoulders', 'arms'] },
        { name: 'Lower Body', focus: 'Legs & Core', bodyParts: ['legs', 'core'] },
        { name: 'Upper Body', focus: 'Strength', bodyParts: ['chest', 'back', 'shoulders', 'arms'] },
        { name: 'Lower Body', focus: 'Hypertrophy', bodyParts: ['legs', 'core'] },
      ]
    } else {
      dayConfigs = [
        { name: 'Push', focus: 'Chest, Shoulders, Triceps', bodyParts: ['chest', 'shoulders', 'arms'] },
        { name: 'Pull', focus: 'Back, Biceps', bodyParts: ['back', 'arms'] },
        { name: 'Legs', focus: 'Quads, Hamstrings, Glutes', bodyParts: ['legs'] },
        { name: 'Push', focus: 'Strength', bodyParts: ['chest', 'shoulders', 'arms'] },
        { name: 'Pull + Legs', focus: 'Full Body', bodyParts: ['back', 'legs', 'core'] },
      ]
    }
  } else if (goal === 'lose_weight') {
    dayConfigs = [
      { name: 'Full Body Circuit', focus: 'Strength + Cardio', bodyParts: ['chest', 'back', 'legs'] },
      { name: 'Upper Body HIIT', focus: 'Intensity', bodyParts: ['chest', 'shoulders', 'arms', 'core'] },
      { name: 'Lower Body Burn', focus: 'Legs + Core', bodyParts: ['legs', 'core'] },
    ]
    if (daysPerWeek >= 4) {
      dayConfigs.push({ name: 'Full Body', focus: 'Metabolic', bodyParts: ['chest', 'back', 'shoulders', 'legs'] })
    }
  } else if (goal === 'flexibility') {
    dayConfigs = [
      { name: 'Full Body Stretch', focus: 'Mobility', bodyParts: ['core', 'legs', 'back'] },
      { name: 'Upper Body', focus: 'Flexibility', bodyParts: ['chest', 'shoulders', 'arms', 'back'] },
      { name: 'Lower Body', focus: 'Flexibility', bodyParts: ['legs', 'core'] },
      { name: 'Full Body', focus: 'Deep Stretch', bodyParts: ['core', 'legs', 'back', 'chest'] },
      { name: 'Recovery', focus: 'Light Mobility', bodyParts: ['core', 'legs'] },
    ]
  } else if (goal === 'endurance') {
    dayConfigs = [
      { name: 'Circuit Day', focus: 'Full Body', bodyParts: ['chest', 'back', 'legs', 'core'] },
      { name: 'Cardio Core', focus: 'Core + Stamina', bodyParts: ['core', 'legs'] },
      { name: 'Strength Endurance', focus: 'Upper Body', bodyParts: ['chest', 'back', 'shoulders', 'arms'] },
    ]
  } else {
    dayConfigs = [
      { name: 'Full Body A', focus: 'Strength', bodyParts: ['chest', 'back', 'legs', 'core'] },
      { name: 'Full Body B', focus: 'Mobility', bodyParts: ['shoulders', 'arms', 'legs', 'core'] },
      { name: 'Full Body C', focus: 'Endurance', bodyParts: ['chest', 'back', 'shoulders', 'legs'] },
    ]
  }

  const usedIds = new Set<string>()
  const exercisesPerDay = isGym ? 6 : experience === 'beginner' ? 4 : 5
  const estMinutesPerExercise = goal === 'flexibility' ? 4 : 5

  const days: WorkoutDay[] = dayConfigs.slice(0, daysPerWeek).map((cfg) => {
    const base = selectExercises(exercisePool, exercisesPerDay, cfg.bodyParts, usedIds)
    const exercises = assignSetsReps(base, goal, experience)
    exercises.forEach((e) => usedIds.add(e.id))
    const estDuration = `${exercises.reduce((acc, e) => acc + e.sets * 2, 0)} min`

    return {
      name: cfg.name,
      focus: cfg.focus,
      exercises,
      estDuration,
    }
  })

  return {
    name: prog.name,
    description: prog.desc,
    daysPerWeek,
    days,
  }
}
