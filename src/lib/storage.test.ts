import { describe, it, expect, beforeEach } from 'vitest'
import { createStore, generateId, type StoredItem } from './storage'

interface TestItem extends StoredItem {
  name: string
  count?: number
}

const KEY = 'test-store'

describe('createStore', () => {
  beforeEach(() => localStorage.clear())

  it('returns empty array when key does not exist', () => {
    // Arrange
    const store = createStore<TestItem>(KEY)

    // Act
    const items = store.get()

    // Assert
    expect(items).toEqual([])
  })

  it('adds an item and persists it', () => {
    // Arrange
    const store = createStore<TestItem>(KEY)
    const item: TestItem = { id: '1', name: 'first' }

    // Act
    const result = store.add(item)

    // Assert
    expect(result).toEqual([item])
    expect(store.get()).toEqual([item])
  })

  it('updates an item by id without mutating others', () => {
    // Arrange
    const store = createStore<TestItem>(KEY)
    store.add({ id: '1', name: 'a' })
    store.add({ id: '2', name: 'b' })

    // Act
    const result = store.update('1', { name: 'updated' })

    // Assert
    expect(result.find((i) => i.id === '1')?.name).toBe('updated')
    expect(result.find((i) => i.id === '2')?.name).toBe('b')
  })

  it('removes an item by id', () => {
    // Arrange
    const store = createStore<TestItem>(KEY)
    store.add({ id: '1', name: 'a' })
    store.add({ id: '2', name: 'b' })

    // Act
    const result = store.remove('1')

    // Assert
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('2')
  })

  it('returns empty array when stored value is corrupt JSON', () => {
    // Arrange
    localStorage.setItem(KEY, '{not json')
    const store = createStore<TestItem>(KEY)

    // Act
    const items = store.get()

    // Assert
    expect(items).toEqual([])
  })

  it('returns empty array when stored value is not an array', () => {
    // Arrange
    localStorage.setItem(KEY, '{"a":1}')
    const store = createStore<TestItem>(KEY)

    // Act
    const items = store.get()

    // Assert
    expect(items).toEqual([])
  })

  it('clears all items for the key', () => {
    // Arrange
    const store = createStore<TestItem>(KEY)
    store.add({ id: '1', name: 'a' })

    // Act
    store.clear()

    // Assert
    expect(store.get()).toEqual([])
    expect(localStorage.getItem(KEY)).toBeNull()
  })
})

describe('generateId', () => {
  it('returns unique non-empty ids', () => {
    // Arrange & Act
    const ids = new Set(Array.from({ length: 50 }, () => generateId()))

    // Assert
    expect(ids.size).toBe(50)
    ids.forEach((id) => expect(id.length).toBeGreaterThan(0))
  })
})
