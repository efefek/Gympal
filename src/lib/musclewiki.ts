/**
 * Exercise database — local-first.
 * Dataset is bundled at build time (src/data/exercises.json, refresh via `npm run data:sync`).
 * GIF/video media stays on the CDN; only metadata is local.
 */
import data from '@/data/exercises.json'

export interface Exercise {
  id: string
  slug: string
  name: string
  muscle: string
  bodyPart: string
  equipment: string
  category: string
  secondaryMuscles: string[]
  instructions: string[]
  gifUrl: string
}

const allExercises = (data as { exercises: Exercise[] }).exercises

export async function getExercises(params?: {
  limit?: number
  search?: string
  equipment?: string
  muscle?: string
  bodyPart?: string
}) {
  let exercises = allExercises

  if (params?.search) {
    const q = params.search.toLowerCase()
    exercises = exercises.filter((e) => e.name.toLowerCase().includes(q))
  }
  if (params?.equipment) {
    const eq = params.equipment.toLowerCase()
    exercises = exercises.filter((e) => e.equipment === eq)
  }
  if (params?.muscle) {
    const m = params.muscle.toLowerCase()
    exercises = exercises.filter((e) => e.muscle === m)
  }
  if (params?.bodyPart) {
    const bp = params.bodyPart.toLowerCase()
    exercises = exercises.filter((e) => e.bodyPart === bp)
  }

  if (params?.limit) {
    exercises = exercises.slice(0, params.limit)
  }

  return { exercises }
}

export async function getEquipment(): Promise<string[]> {
  return Array.from(new Set(allExercises.map((e) => e.equipment))).sort()
}
