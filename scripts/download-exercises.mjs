/**
 * Downloads the exercise dataset from the MuscleWiki CDN and stores it locally
 * so the app can run fully offline (local-first / static export / Capacitor APK).
 *
 * Usage: npm run data:sync
 * Output: src/data/exercises.json
 */
import { writeFile, mkdir } from 'node:fs/promises'

const BASE = 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0'
const OUT_DIR = new URL('../src/data/', import.meta.url)
const OUT_FILE = new URL('../src/data/exercises.json', import.meta.url)

async function main() {
  console.log('Downloading exercise dataset...')
  const res = await fetch(`${BASE}/api/en/exercises.json`, {
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) {
    throw new Error(`CDN request failed: ${res.status} ${res.statusText}`)
  }

  const data = await res.json()
  if (!Array.isArray(data.exercises) || data.exercises.length === 0) {
    throw new Error('Unexpected dataset shape: missing exercises array')
  }

  await mkdir(OUT_DIR, { recursive: true })
  await writeFile(OUT_FILE, JSON.stringify(data))

  const sizeMb = (JSON.stringify(data).length / 1024 / 1024).toFixed(2)
  console.log(`Saved ${data.exercises.length} exercises (${sizeMb} MB) -> src/data/exercises.json`)
}

main().catch((err) => {
  console.error(err.message)
  process.exit(1)
})
