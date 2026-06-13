export type Goal = 'lose_weight' | 'build_muscle' | 'general_fitness' | 'flexibility' | 'endurance'
export type Experience = 'beginner' | 'intermediate' | 'advanced'
export type EquipmentType =
  | 'bodyweight'
  | 'dumbbell'
  | 'barbell'
  | 'kettlebell'
  | 'resistance_band'
  | 'cable'
  | 'machine'
  | 'chair'
  | 'yoga_mat'
  | 'ez_bar'
  | 'lever'
  | 'sled'
  | 'smith'
  | 'other'

export type WorkoutLocation = 'home' | 'gym'

export interface UserProfile {
  height: number
  weight: number
  goal: Goal
  experience: Experience
  equipment: EquipmentType[]
  location: WorkoutLocation
  dietaryPreferences?: string
  foodDislikes?: string
  allergens?: string
  dailyWaterMlTarget?: number
  dailyProteinGTarget?: number
}

const STORAGE_KEY = 'gympal-profile'

const DEFAULT_NUTRITION = {
  dietaryPreferences: '',
  foodDislikes: '',
  allergens: '',
  dailyWaterMlTarget: 2500,
  dailyProteinGTarget: 150,
}

export function getProfile(): UserProfile | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return { ...DEFAULT_NUTRITION, ...(JSON.parse(raw) as UserProfile) }
  } catch {
    return null
  }
}

export function saveProfile(profile: UserProfile) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
}

export function clearProfile() {
  localStorage.removeItem(STORAGE_KEY)
}

export const goalLabels: Record<Goal, string> = {
  lose_weight: 'Lose Weight',
  build_muscle: 'Build Muscle',
  general_fitness: 'General Fitness',
  flexibility: 'Flexibility & Mobility',
  endurance: 'Endurance',
}

export const experienceLabels: Record<Experience, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
}

export const equipmentLabels: Record<EquipmentType, string> = {
  bodyweight: 'Bodyweight',
  dumbbell: 'Dumbbell',
  barbell: 'Barbell',
  kettlebell: 'Kettlebell',
  resistance_band: 'Resistance Band',
  cable: 'Cable Machine',
  machine: 'Gym Machine',
  chair: 'Chair',
  yoga_mat: 'Yoga Mat',
  ez_bar: 'EZ Bar',
  lever: 'Lever Machine',
  sled: 'Sled',
  smith: 'Smith Machine',
  other: 'Other',
}

export function bmiCategory(bmi: number): string {
  if (bmi < 18.5) return 'underweight'
  if (bmi < 25) return 'normal'
  if (bmi < 30) return 'overweight'
  return 'obese'
}

export function calcBMI(height: number, weight: number): number {
  const h = height / 100
  return weight / (h * h)
}

export function recommendedCategories(goal: Goal): string[] {
  switch (goal) {
    case 'build_muscle': return ['strength']
    case 'lose_weight': return ['cardio', 'strength']
    case 'flexibility': return ['stretching', 'yoga']
    case 'endurance': return ['cardio']
    default: return []
  }
}

const profileToApiEquipment: Record<EquipmentType, string[]> = {
  bodyweight: ['bodyweight'],
  dumbbell: ['dumbbell'],
  barbell: ['barbell'],
  kettlebell: ['kettlebell'],
  resistance_band: ['band'],
  cable: ['cable'],
  machine: ['machine', 'lever', 'sled', 'smith'],
  chair: ['bodyweight'],
  yoga_mat: ['bodyweight'],
  ez_bar: ['ez-bar'],
  lever: ['lever'],
  sled: ['sled'],
  smith: ['smith'],
  other: ['bodyweight', 'other'],
}

export function mapProfileEquipmentToApi(equipment: EquipmentType[]): string[] {
  const set = new Set<string>()
  for (const eq of equipment) {
    for (const api of profileToApiEquipment[eq]) {
      set.add(api)
    }
  }
  return Array.from(set)
}

export function defaultEquipment(apiEquipments: string[], userApiEquipments: string[]): string {
  if (userApiEquipments.length === 1) return userApiEquipments[0]
  return ''
}
