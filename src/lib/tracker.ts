/**
 * Companion dashboard domain: types, stores, and helpers for
 * weight log, mood journal, daily checklist, todo, shopping, and meal plan.
 * All persistence goes through lib/storage — components never touch localStorage directly.
 */
import { createStore, generateId } from './storage'

/* ─── Types ─────────────────────────────────────────────── */

export interface WeightEntry {
  id: string
  date: string // YYYY-MM-DD (local)
  kg: number
}

export type MoodLevel = 1 | 2 | 3 | 4 | 5

export interface MoodEntry {
  id: string
  date: string // YYYY-MM-DD (local)
  level: MoodLevel
}

export interface ChecklistItem {
  id: string
  label: string
  doneDates: string[] // YYYY-MM-DD entries when completed
}

export interface TodoItem {
  id: string
  text: string
  done: boolean
  createdAt: string // ISO
}

export interface ShoppingItem {
  id: string
  text: string
  done: boolean
  createdAt: string // ISO
}

export type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'snack'

export interface MealEntry {
  id: string // `${day}-${slot}` — one cell per day+slot
  day: number // 0 = Monday … 6 = Sunday
  slot: MealSlot
  text: string
}

export const MEAL_SLOTS: MealSlot[] = ['breakfast', 'lunch', 'dinner', 'snack']

export interface BodyMeasurement {
  id: string
  date: string // YYYY-MM-DD
  weight?: number
  height?: number
  armCirc?: number
  waistCirc?: number
  bodyFat?: number
  chest?: number
}

export interface HealthVital {
  id: string
  date: string // YYYY-MM-DD
  heartRate?: number
  bloodPressureSys?: number
  bloodPressureDia?: number
  waterMl?: number
  proteinG?: number
  steps?: number
}

/* ─── Stores ────────────────────────────────────────────── */

export const weightStore = createStore<WeightEntry>('gympal-weight-log')
export const moodStore = createStore<MoodEntry>('gympal-mood')
export const checklistStore = createStore<ChecklistItem>('gympal-checklist')
export const todoStore = createStore<TodoItem>('gympal-todos')
export const shoppingStore = createStore<ShoppingItem>('gympal-shopping')
export const mealStore = createStore<MealEntry>('gympal-meals')
export const measurementStore = createStore<BodyMeasurement>('gympal-measurements')
export const vitalStore = createStore<HealthVital>('gympal-vitals')

/* ─── Date helpers ──────────────────────────────────────── */

export function todayKey(date: Date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/* ─── Weight ────────────────────────────────────────────── */

/** Upserts today's weight entry (one entry per day), returns updated log sorted by date. */
export function logWeight(kg: number, date: string = todayKey()): WeightEntry[] {
  const entries = weightStore.get()
  const existing = entries.find((e) => e.date === date)
  const next = existing
    ? weightStore.update(existing.id, { kg })
    : weightStore.add({ id: generateId(), date, kg })
  return [...next].sort((a, b) => a.date.localeCompare(b.date))
}

export function getWeightLog(): WeightEntry[] {
  return [...weightStore.get()].sort((a, b) => a.date.localeCompare(b.date))
}

/* ─── Mood ──────────────────────────────────────────────── */

/** Upserts the mood for a given day (one mood per day). */
export function logMood(level: MoodLevel, date: string = todayKey()): MoodEntry[] {
  const entries = moodStore.get()
  const existing = entries.find((e) => e.date === date)
  if (existing) return moodStore.update(existing.id, { level })
  return moodStore.add({ id: generateId(), date, level })
}

export function getMoodFor(date: string): MoodEntry | undefined {
  return moodStore.get().find((e) => e.date === date)
}

/* ─── Checklist ─────────────────────────────────────────── */

export function addChecklistItem(label: string): ChecklistItem[] {
  return checklistStore.add({ id: generateId(), label, doneDates: [] })
}

/** Toggles completion of a checklist item for a given day (immutable). */
export function toggleChecklistDone(id: string, date: string = todayKey()): ChecklistItem[] {
  const item = checklistStore.get().find((i) => i.id === id)
  if (!item) return checklistStore.get()
  const doneDates = item.doneDates.includes(date)
    ? item.doneDates.filter((d) => d !== date)
    : [...item.doneDates, date]
  return checklistStore.update(id, { doneDates })
}

/** Returns 0-100 completion percentage for a given day. */
export function checklistCompletion(items: ChecklistItem[], date: string = todayKey()): number {
  if (items.length === 0) return 0
  const done = items.filter((i) => i.doneDates.includes(date)).length
  return Math.round((done / items.length) * 100)
}

/* ─── Meals ─────────────────────────────────────────────── */

export function mealCellId(day: number, slot: MealSlot): string {
  return `${day}-${slot}`
}

/** Sets (or clears, when text is empty) the meal text for a day+slot cell. */
export function setMeal(day: number, slot: MealSlot, text: string): MealEntry[] {
  const id = mealCellId(day, slot)
  const entries = mealStore.get()
  const existing = entries.find((e) => e.id === id)
  if (!text.trim()) {
    return existing ? mealStore.remove(id) : entries
  }
  if (existing) return mealStore.update(id, { text })
  return mealStore.add({ id, day, slot, text })
}

/* ─── Body Measurements ─────────────────────────────────── */

export function logMeasurement(
  measurement: Omit<BodyMeasurement, 'id'>,
  date: string = todayKey()
): BodyMeasurement[] {
  const entries = measurementStore.get()
  const existing = entries.find((e) => e.date === date)
  const next = existing
    ? measurementStore.update(existing.id, measurement)
    : measurementStore.add({ id: generateId(), ...measurement, date })
  return [...next].sort((a, b) => a.date.localeCompare(b.date))
}

export function getMeasurements(): BodyMeasurement[] {
  return [...measurementStore.get()].sort((a, b) => a.date.localeCompare(b.date))
}

/* ─── Health Vitals ─────────────────────────────────────── */

export function logVital(
  vital: Omit<HealthVital, 'id'>,
  date: string = todayKey()
): HealthVital[] {
  const entries = vitalStore.get()
  const existing = entries.find((e) => e.date === date)
  const next = existing
    ? vitalStore.update(existing.id, vital)
    : vitalStore.add({ id: generateId(), ...vital, date })
  return [...next].sort((a, b) => a.date.localeCompare(b.date))
}

export function getVitals(): HealthVital[] {
  return [...vitalStore.get()].sort((a, b) => a.date.localeCompare(b.date))
}
