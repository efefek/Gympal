/**
 * Generic typed localStorage repository.
 * All operations are immutable and SSR-safe.
 * Future backend sync can be added behind this interface without touching consumers.
 */

export interface StoredItem {
  id: string
}

export function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function readKey<T>(key: string): T[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as T[]) : []
  } catch (error) {
    console.error(`storage: failed to read "${key}"`, error)
    return []
  }
}

function writeKey<T>(key: string, items: T[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(items))
  } catch (error) {
    console.error(`storage: failed to write "${key}"`, error)
  }
}

export interface Store<T extends StoredItem> {
  get(): T[]
  set(items: T[]): T[]
  add(item: T): T[]
  update(id: string, patch: Partial<T>): T[]
  remove(id: string): T[]
  clear(): void
}

export function createStore<T extends StoredItem>(key: string): Store<T> {
  return {
    get() {
      return readKey<T>(key)
    },
    set(items) {
      writeKey(key, items)
      return items
    },
    add(item) {
      const next = [...readKey<T>(key), item]
      writeKey(key, next)
      return next
    },
    update(id, patch) {
      const next = readKey<T>(key).map((item) =>
        item.id === id ? { ...item, ...patch } : item
      )
      writeKey(key, next)
      return next
    },
    remove(id) {
      const next = readKey<T>(key).filter((item) => item.id !== id)
      writeKey(key, next)
      return next
    },
    clear() {
      if (typeof window === 'undefined') return
      localStorage.removeItem(key)
    },
  }
}
