import { createStore } from './storage'

export interface SocialPost {
  id: string
  userId: string
  userName: string
  userAvatar: string
  type: 'workout' | 'meal' | 'achievement' | 'general'
  content: string
  mediaUrl?: string
  location?: string
  distance?: number
  likes: number
  comments: number
  createdAt: string
}

export interface Achievement {
  id: string
  key: 'first_workout' | '10_workouts' | '50km_run' | '30day_streak'
  unlockedAt: string
  shared: boolean
}

export interface SocialProfile {
  bio: string
  connections: string[]
  dietType?: 'omnivore' | 'vegetarian' | 'vegan'
  goal: 'lose_weight' | 'build_muscle' | 'general_fitness' | 'flexibility' | 'endurance'
  hobbies: string[]
  socialLinks?: {
    instagram?: string
    twitter?: string
  }
}

export const socialPostStore = createStore<SocialPost>('gympal-social-posts')
export const achievementStore = createStore<Achievement>('gympal-achievements')
