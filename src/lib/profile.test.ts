import { describe, it, expect, beforeEach } from 'vitest'
import {
  calcBMI,
  bmiCategory,
  recommendedCategories,
  mapProfileEquipmentToApi,
  defaultEquipment,
  goalLabels,
  experienceLabels,
  equipmentLabels,
  getProfile,
  saveProfile,
  clearProfile,
} from './profile'
import type { Goal, EquipmentType, UserProfile } from './profile'

// ---------------------------------------------------------------------------
// calcBMI
// ---------------------------------------------------------------------------
describe('calcBMI', () => {
  it('returns correct BMI for typical values', () => {
    // Arrange
    const height = 180 // cm
    const weight = 80  // kg
    // Act
    const result = calcBMI(height, weight)
    // Assert — 80 / (1.8 * 1.8) = 24.69...
    expect(result).toBeCloseTo(24.69, 1)
  })

  it('returns correct BMI when weight is low (underweight range)', () => {
    const result = calcBMI(175, 50)
    // 50 / (1.75^2) = 16.32...
    expect(result).toBeCloseTo(16.32, 1)
  })

  it('returns correct BMI when weight is high (obese range)', () => {
    const result = calcBMI(170, 100)
    // 100 / (1.70^2) = 34.60...
    expect(result).toBeCloseTo(34.60, 1)
  })
})

// ---------------------------------------------------------------------------
// bmiCategory
// ---------------------------------------------------------------------------
describe('bmiCategory', () => {
  it('returns underweight when bmi < 18.5', () => {
    expect(bmiCategory(17)).toBe('underweight')
    expect(bmiCategory(18.4)).toBe('underweight')
  })

  it('returns normal when bmi is between 18.5 and 24.9', () => {
    expect(bmiCategory(18.5)).toBe('normal')
    expect(bmiCategory(22)).toBe('normal')
    expect(bmiCategory(24.9)).toBe('normal')
  })

  it('returns overweight when bmi is between 25 and 29.9', () => {
    expect(bmiCategory(25)).toBe('overweight')
    expect(bmiCategory(27)).toBe('overweight')
    expect(bmiCategory(29.9)).toBe('overweight')
  })

  it('returns obese when bmi is 30 or above', () => {
    expect(bmiCategory(30)).toBe('obese')
    expect(bmiCategory(40)).toBe('obese')
  })
})

// ---------------------------------------------------------------------------
// recommendedCategories
// ---------------------------------------------------------------------------
describe('recommendedCategories', () => {
  it('returns strength for build_muscle goal', () => {
    expect(recommendedCategories('build_muscle')).toEqual(['strength'])
  })

  it('returns cardio and strength for lose_weight goal', () => {
    const result = recommendedCategories('lose_weight')
    expect(result).toContain('cardio')
    expect(result).toContain('strength')
  })

  it('returns stretching and yoga for flexibility goal', () => {
    const result = recommendedCategories('flexibility')
    expect(result).toContain('stretching')
    expect(result).toContain('yoga')
  })

  it('returns cardio for endurance goal', () => {
    expect(recommendedCategories('endurance')).toEqual(['cardio'])
  })

  it('returns empty array for general_fitness goal', () => {
    expect(recommendedCategories('general_fitness')).toEqual([])
  })
})

// ---------------------------------------------------------------------------
// mapProfileEquipmentToApi
// ---------------------------------------------------------------------------
describe('mapProfileEquipmentToApi', () => {
  it('maps dumbbell to dumbbell api value', () => {
    const result = mapProfileEquipmentToApi(['dumbbell'])
    expect(result).toContain('dumbbell')
  })

  it('maps machine to multiple api values', () => {
    const result = mapProfileEquipmentToApi(['machine'])
    expect(result).toContain('machine')
    expect(result).toContain('lever')
    expect(result).toContain('sled')
    expect(result).toContain('smith')
  })

  it('deduplicates overlapping api values across equipment types', () => {
    // machine already maps to lever; adding lever separately shouldn't duplicate
    const result = mapProfileEquipmentToApi(['machine', 'lever'])
    const leverCount = result.filter((v) => v === 'lever').length
    expect(leverCount).toBe(1)
  })

  it('returns empty array for empty equipment list', () => {
    expect(mapProfileEquipmentToApi([])).toEqual([])
  })

  it('handles multiple equipment types and returns unique values', () => {
    const result = mapProfileEquipmentToApi(['barbell', 'dumbbell', 'kettlebell'])
    expect(result).toContain('barbell')
    expect(result).toContain('dumbbell')
    expect(result).toContain('kettlebell')
    // All entries should be unique
    expect(result.length).toBe(new Set(result).size)
  })

  it('maps resistance_band to band', () => {
    const result = mapProfileEquipmentToApi(['resistance_band'])
    expect(result).toContain('band')
  })
})

// ---------------------------------------------------------------------------
// defaultEquipment
// ---------------------------------------------------------------------------
describe('defaultEquipment', () => {
  it('returns the single item when userApiEquipments has exactly one entry', () => {
    const result = defaultEquipment(['barbell', 'dumbbell'], ['barbell'])
    expect(result).toBe('barbell')
  })

  it('returns empty string when userApiEquipments has more than one entry', () => {
    const result = defaultEquipment(['barbell', 'dumbbell'], ['barbell', 'dumbbell'])
    expect(result).toBe('')
  })

  it('returns empty string when userApiEquipments is empty', () => {
    const result = defaultEquipment(['barbell'], [])
    expect(result).toBe('')
  })
})

// ---------------------------------------------------------------------------
// label maps — existence and completeness
// ---------------------------------------------------------------------------
describe('goalLabels', () => {
  const goals: Goal[] = ['lose_weight', 'build_muscle', 'general_fitness', 'flexibility', 'endurance']

  it('contains a label for every goal', () => {
    for (const goal of goals) {
      expect(goalLabels[goal]).toBeTruthy()
    }
  })

  it('returns human-readable strings (not snake_case)', () => {
    for (const goal of goals) {
      expect(goalLabels[goal]).not.toMatch(/_/)
    }
  })
})

describe('experienceLabels', () => {
  it('has labels for beginner, intermediate, and advanced', () => {
    expect(experienceLabels.beginner).toBeTruthy()
    expect(experienceLabels.intermediate).toBeTruthy()
    expect(experienceLabels.advanced).toBeTruthy()
  })
})

describe('equipmentLabels', () => {
  const equipments: EquipmentType[] = [
    'bodyweight', 'dumbbell', 'barbell', 'kettlebell', 'resistance_band',
    'cable', 'machine', 'chair', 'yoga_mat', 'ez_bar', 'lever', 'sled', 'smith', 'other',
  ]

  it('has a label for every equipment type', () => {
    for (const eq of equipments) {
      expect(equipmentLabels[eq]).toBeTruthy()
    }
  })
})

// ---------------------------------------------------------------------------
// localStorage functions — getProfile / saveProfile / clearProfile
// ---------------------------------------------------------------------------
describe('profile localStorage functions', () => {
  const sampleProfile: UserProfile = {
    height: 175,
    weight: 70,
    goal: 'build_muscle',
    experience: 'intermediate',
    equipment: ['dumbbell', 'barbell'],
    location: 'gym',
  }

  beforeEach(() => {
    localStorage.clear()
  })

  it('getProfile returns null when nothing is stored', () => {
    expect(getProfile()).toBeNull()
  })

  it('saveProfile then getProfile round-trips correctly', () => {
    saveProfile(sampleProfile)
    const loaded = getProfile()
    expect(loaded).toMatchObject(sampleProfile)
    expect(loaded).toMatchObject({
      dietaryPreferences: '',
      foodDislikes: '',
      allergens: '',
      dailyWaterMlTarget: 2500,
      dailyProteinGTarget: 150,
    })
  })

  it('clearProfile removes the saved profile', () => {
    saveProfile(sampleProfile)
    clearProfile()
    expect(getProfile()).toBeNull()
  })

  it('getProfile returns null when stored value is invalid JSON', () => {
    localStorage.setItem('gympal-profile', 'not-valid-json')
    expect(getProfile()).toBeNull()
  })
})
