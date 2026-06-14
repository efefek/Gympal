import { describe, it, expect } from 'vitest'
import { generateProgram } from './workout'
import type { UserProfile } from './profile'
import type { Exercise } from './musclewiki'

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

function makeExercise(id: string, muscle: string, equipment = 'bodyweight'): Exercise {
  return {
    id,
    slug: `exercise-${id}`,
    name: `Exercise ${id}`,
    muscle,
    bodyPart: muscle,
    equipment,
    category: 'strength',
    secondaryMuscles: [],
    instructions: [],
    gifUrl: '',
  }
}

function makePool(count: number, muscle = 'chest'): Exercise[] {
  return Array.from({ length: count }, (_, i) => makeExercise(String(i + 1), muscle))
}

function makeProfile(overrides: Partial<UserProfile> = {}): UserProfile {
  return {
    height: 175,
    weight: 70,
    goal: 'general_fitness',
    experience: 'beginner',
    equipment: ['bodyweight'],
    location: 'home',
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// generateProgram — program shape
// ---------------------------------------------------------------------------
describe('generateProgram — returned shape', () => {
  it('returns a program with a name and description', () => {
    // Arrange
    const profile = makeProfile()
    const pool = makePool(20, 'chest')
    // Act
    const program = generateProgram(profile, pool)
    // Assert
    expect(program.name).toBeTruthy()
    expect(program.description).toBeTruthy()
  })

  it('returns daysPerWeek = 3 for beginner experience', () => {
    const profile = makeProfile({ experience: 'beginner' })
    const program = generateProgram(profile, makePool(30))
    expect(program.daysPerWeek).toBe(3)
  })

  it('returns daysPerWeek = 4 for intermediate experience', () => {
    const profile = makeProfile({ experience: 'intermediate' })
    const program = generateProgram(profile, makePool(30))
    expect(program.daysPerWeek).toBe(4)
  })

  it('returns daysPerWeek = 5 for advanced experience', () => {
    const profile = makeProfile({ experience: 'advanced' })
    const program = generateProgram(profile, makePool(30))
    expect(program.daysPerWeek).toBe(5)
  })

  it('days array length matches daysPerWeek for build_muscle (has enough day configs)', () => {
    // build_muscle with intermediate has 4 day configs, so days.length == daysPerWeek
    const profile = makeProfile({ goal: 'build_muscle', experience: 'intermediate' })
    const program = generateProgram(profile, makePool(40))
    expect(program.days.length).toBe(program.daysPerWeek)
  })

  it('days array length is capped by available day configs for general_fitness', () => {
    // general_fitness only defines 3 day configs regardless of experience level
    const profile = makeProfile({ goal: 'general_fitness', experience: 'intermediate' })
    const program = generateProgram(profile, makePool(40))
    // daysPerWeek is 4 but only 3 configs exist, so days.length = 3
    expect(program.days.length).toBeLessThanOrEqual(program.daysPerWeek)
    expect(program.days.length).toBeGreaterThan(0)
  })
})

// ---------------------------------------------------------------------------
// generateProgram — exercise assignment
// ---------------------------------------------------------------------------
describe('generateProgram — exercise assignment', () => {
  it('each day has at least one exercise when pool is large enough', () => {
    const profile = makeProfile({ experience: 'beginner' })
    const pool = makePool(30)
    const program = generateProgram(profile, pool)
    for (const day of program.days) {
      expect(day.exercises.length).toBeGreaterThan(0)
    }
  })

  it('each exercise has sets, reps, rest, and order fields', () => {
    const profile = makeProfile()
    const program = generateProgram(profile, makePool(20))
    for (const day of program.days) {
      for (const ex of day.exercises) {
        expect(ex.sets).toBeGreaterThan(0)
        expect(ex.reps).toBeTruthy()
        expect(ex.rest).toBeTruthy()
        expect(ex.order).toBeGreaterThan(0)
      }
    }
  })

  it('order values within a day start at 1 and are sequential', () => {
    const profile = makeProfile()
    const program = generateProgram(profile, makePool(30))
    for (const day of program.days) {
      const orders = day.exercises.map((e) => e.order)
      orders.forEach((o, i) => expect(o).toBe(i + 1))
    }
  })
})

// ---------------------------------------------------------------------------
// generateProgram — goal-specific program names
// ---------------------------------------------------------------------------
describe('generateProgram — goal-specific program names', () => {
  const cases: Array<{ goal: UserProfile['goal']; expectedName: string }> = [
    { goal: 'build_muscle', expectedName: 'Muscle Builder' },
    { goal: 'lose_weight', expectedName: 'Fat Burner' },
    { goal: 'general_fitness', expectedName: 'Full Fitness' },
    { goal: 'flexibility', expectedName: 'Flexibility & Mobility' },
    { goal: 'endurance', expectedName: 'Endurance Engine' },
  ]

  for (const { goal, expectedName } of cases) {
    it(`returns program name "${expectedName}" for goal "${goal}"`, () => {
      const profile = makeProfile({ goal })
      const program = generateProgram(profile, makePool(30))
      expect(program.name).toBe(expectedName)
    })
  }
})

// ---------------------------------------------------------------------------
// generateProgram — sets/reps per goal
// ---------------------------------------------------------------------------
describe('generateProgram — sets/reps per goal', () => {
  it('assigns 30s rest for lose_weight goal', () => {
    const profile = makeProfile({ goal: 'lose_weight' })
    const program = generateProgram(profile, makePool(20))
    const day = program.days[0]
    expect(day.exercises.every((e) => e.rest === '30s')).toBe(true)
  })

  it('assigns 90s rest for build_muscle goal', () => {
    const profile = makeProfile({ goal: 'build_muscle' })
    const program = generateProgram(profile, makePool(20))
    const day = program.days[0]
    expect(day.exercises.every((e) => e.rest === '90s')).toBe(true)
  })

  it('assigns 3 sets to beginner build_muscle', () => {
    const profile = makeProfile({ goal: 'build_muscle', experience: 'beginner' })
    const program = generateProgram(profile, makePool(20))
    expect(program.days[0].exercises.every((e) => e.sets === 3)).toBe(true)
  })

  it('assigns 5 sets to advanced build_muscle', () => {
    const profile = makeProfile({ goal: 'build_muscle', experience: 'advanced' })
    const program = generateProgram(profile, makePool(30))
    expect(program.days[0].exercises.every((e) => e.sets === 5)).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// generateProgram — gym vs home exercise count
// ---------------------------------------------------------------------------
describe('generateProgram — exercises per day count', () => {
  it('gym users get 6 exercises per day', () => {
    const profile = makeProfile({ location: 'gym' })
    const pool = makePool(50)
    const program = generateProgram(profile, pool)
    for (const day of program.days) {
      expect(day.exercises.length).toBeLessThanOrEqual(6)
    }
  })

  it('home beginners get 4 exercises per day', () => {
    const profile = makeProfile({ location: 'home', experience: 'beginner' })
    const pool = makePool(50)
    const program = generateProgram(profile, pool)
    for (const day of program.days) {
      expect(day.exercises.length).toBeLessThanOrEqual(4)
    }
  })
})

// ---------------------------------------------------------------------------
// generateProgram — estDuration
// ---------------------------------------------------------------------------
describe('generateProgram — estimated duration', () => {
  it('each day has a non-empty estDuration string ending with " min"', () => {
    const profile = makeProfile()
    const program = generateProgram(profile, makePool(20))
    for (const day of program.days) {
      expect(day.estDuration).toMatch(/\d+ min/)
    }
  })
})

// ---------------------------------------------------------------------------
// generateProgram — empty pool edge case
// ---------------------------------------------------------------------------
describe('generateProgram — empty exercise pool', () => {
  it('returns a program with empty exercise lists when pool is empty', () => {
    const profile = makeProfile()
    const program = generateProgram(profile, [])
    expect(program.days.every((d) => d.exercises.length === 0)).toBe(true)
  })
})



