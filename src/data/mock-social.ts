import type { SocialPost, Achievement } from '@/lib/social'

export const MOCK_POSTS: SocialPost[] = [
  {
    id: '1',
    userId: 'user-1',
    userName: 'Alex Turner',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
    type: 'workout',
    content: 'Crushed a 10km run this morning! Feeling strong!',
    location: 'Central Park',
    distance: 10,
    likes: 24,
    comments: 3,
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: '2',
    userId: 'user-2',
    userName: 'Jordan Lee',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jordan',
    type: 'meal',
    content: 'Protein-packed breakfast bowl — chicken, brown rice & greens',
    likes: 15,
    comments: 2,
    createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
  },
  {
    id: '3',
    userId: 'user-3',
    userName: 'Sam Knight',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sam',
    type: 'achievement',
    content: 'Just unlocked: 50km Total Distance! 🎉',
    likes: 42,
    comments: 8,
    createdAt: new Date(Date.now() - 1 * 3600000).toISOString(),
  },
  {
    id: '4',
    userId: 'user-4',
    userName: 'Casey Morgan',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=casey',
    type: 'general',
    content: 'Push day complete! 💪 Feeling pumped',
    likes: 18,
    comments: 5,
    createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
  },
]

export const MOCK_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach-1',
    key: 'first_workout',
    unlockedAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    shared: true,
  },
  {
    id: 'ach-2',
    key: '10_workouts',
    unlockedAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    shared: false,
  },
  {
    id: 'ach-3',
    key: '50km_run',
    unlockedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    shared: true,
  },
]

export const MOCK_EVENTS = [
  {
    id: '1',
    title: 'Morning 5K Run',
    date: new Date(Date.now() + 2 * 86400000).toISOString(),
    category: 'Running',
    location: 'Central Park',
    participants: 24,
    distance: 5,
  },
  {
    id: '2',
    title: 'Group Yoga Session',
    date: new Date(Date.now() + 3 * 86400000).toISOString(),
    category: 'Yoga',
    location: 'Riverside Studio',
    participants: 12,
    distance: 0,
  },
  {
    id: '3',
    title: 'Strength Training Meetup',
    date: new Date(Date.now() + 5 * 86400000).toISOString(),
    category: 'Strength',
    location: 'Downtown Gym',
    participants: 18,
    distance: 0,
  },
]
