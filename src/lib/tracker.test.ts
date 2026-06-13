import { describe, it, expect, beforeEach } from 'vitest'
import {
  todayKey,
  logWeight,
  getWeightLog,
  logMood,
  getMoodFor,
  addChecklistItem,
  toggleChecklistDone,
  checklistCompletion,
  setMeal,
  mealStore,
  checklistStore,
  type ChecklistItem,
} from './tracker'

describe('todayKey', () => {
  it('formats a date as YYYY-MM-DD in local time', () => {
    // Arrange
    const date = new Date(2026, 5, 13) // 13 June 2026

    // Act
    const key = todayKey(date)

    // Assert
    expect(key).toBe('2026-06-13')
  })
})

describe('logWeight', () => {
  beforeEach(() => localStorage.clear())

  it('adds a new entry when none exists for the date', () => {
    // Act
    const result = logWeight(80, '2026-06-10')

    // Assert
    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({ date: '2026-06-10', kg: 80 })
  })

  it('upserts when an entry exists for the same date', () => {
    // Arrange
    logWeight(80, '2026-06-10')

    // Act
    const result = logWeight(79.5, '2026-06-10')

    // Assert
    expect(result).toHaveLength(1)
    expect(result[0].kg).toBe(79.5)
  })

  it('returns entries sorted by date ascending', () => {
    // Arrange
    logWeight(81, '2026-06-12')
    logWeight(82, '2026-06-01')

    // Act
    const log = getWeightLog()

    // Assert
    expect(log.map((e) => e.date)).toEqual(['2026-06-01', '2026-06-12'])
  })
})

describe('logMood', () => {
  beforeEach(() => localStorage.clear())

  it('stores one mood per day and upserts on repeat', () => {
    // Arrange
    logMood(3, '2026-06-13')

    // Act
    const result = logMood(5, '2026-06-13')

    // Assert
    expect(result).toHaveLength(1)
    expect(getMoodFor('2026-06-13')?.level).toBe(5)
  })

  it('returns undefined when no mood is logged for the date', () => {
    // Act & Assert
    expect(getMoodFor('2026-01-01')).toBeUndefined()
  })
})

describe('checklist', () => {
  beforeEach(() => localStorage.clear())

  it('adds items with empty doneDates', () => {
    // Act
    const items = addChecklistItem('Drink water')

    // Assert
    expect(items[0]).toMatchObject({ label: 'Drink water', doneDates: [] })
  })

  it('toggles completion for a specific day', () => {
    // Arrange
    const [item] = addChecklistItem('Stretch')

    // Act
    const afterOn = toggleChecklistDone(item.id, '2026-06-13')
    const afterOff = toggleChecklistDone(item.id, '2026-06-13')

    // Assert
    expect(afterOn[0].doneDates).toContain('2026-06-13')
    expect(afterOff[0].doneDates).not.toContain('2026-06-13')
  })

  it('returns unchanged list when toggling an unknown id', () => {
    // Arrange
    addChecklistItem('Read')

    // Act
    const result = toggleChecklistDone('missing-id', '2026-06-13')

    // Assert
    expect(result).toEqual(checklistStore.get())
  })

  it('computes completion percentage for a day', () => {
    // Arrange
    const items: ChecklistItem[] = [
      { id: '1', label: 'a', doneDates: ['2026-06-13'] },
      { id: '2', label: 'b', doneDates: [] },
    ]

    // Act & Assert
    expect(checklistCompletion(items, '2026-06-13')).toBe(50)
    expect(checklistCompletion([], '2026-06-13')).toBe(0)
  })
})

describe('setMeal', () => {
  beforeEach(() => localStorage.clear())

  it('creates a cell entry keyed by day and slot', () => {
    // Act
    const result = setMeal(0, 'breakfast', 'Oats')

    // Assert
    expect(result[0]).toMatchObject({ id: '0-breakfast', day: 0, slot: 'breakfast', text: 'Oats' })
  })

  it('updates an existing cell instead of duplicating', () => {
    // Arrange
    setMeal(0, 'breakfast', 'Oats')

    // Act
    const result = setMeal(0, 'breakfast', 'Eggs')

    // Assert
    expect(result).toHaveLength(1)
    expect(result[0].text).toBe('Eggs')
  })

  it('removes the cell when text is blank', () => {
    // Arrange
    setMeal(1, 'dinner', 'Pasta')

    // Act
    const result = setMeal(1, 'dinner', '   ')

    // Assert
    expect(result).toHaveLength(0)
    expect(mealStore.get()).toHaveLength(0)
  })
})
