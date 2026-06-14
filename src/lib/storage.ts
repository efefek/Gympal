import { createMMKV } from 'react-native-mmkv'
import * as Crypto from 'expo-crypto'

// Singleton MMKV instance — tüm gympal-* key'leri buraya yazar
// react-native-mmkv v4 Nitro: instance createMMKV() ile oluşturulur
export const mmkv = createMMKV()

export interface StoredItem {
  id: string
}

export function generateId(): string {
  return Crypto.randomUUID()
}

// Tüm gympal-* key'lerini siler (Settings "clear all data")
export function clearAllGympalData(): void {
  const GYMPAL_KEYS = [
    'gympal-profile',
    'gympal-program-custom',
    'gympal-weight-log',
    'gympal-mood',
    'gympal-checklist',
    'gympal-todos',
    'gympal-shopping',
    'gympal-meals',
    'gympal-measurements',
    'gympal-vitals',
    'gympal-buddy-key',
    'gympal-buddy-model',
    'theme',
  ]
  for (const key of GYMPAL_KEYS) {
    mmkv.delete(key)
  }
}

function readKey<T>(key: string): T[] {
  try {
    const raw = mmkv.getString(key)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as T[]) : []
  } catch {
    return []
  }
}

function writeKey<T>(key: string, items: T[]): void {
  try {
    mmkv.set(key, JSON.stringify(items))
  } catch {
    // depolama hatası — sessizce geç
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
        item.id === id ? { ...item, ...patch } : item,
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
      mmkv.delete(key)
    },
  }
}
