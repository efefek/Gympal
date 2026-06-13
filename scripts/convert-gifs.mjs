/**
 * Batch-converts exercise GIFs to looping MP4s using FFmpeg with NVENC (RTX GPU).
 * Resumable: skips any slug whose .mp4 already exists.
 *
 * Run on the machine with the GPU + ffmpeg installed:
 *   node scripts/convert-gifs.mjs
 *
 * See scripts/VIDEO_PIPELINE.md for setup and publishing instructions.
 */
import { readFile, writeFile, mkdir, access, readdir } from 'node:fs/promises'
import { createWriteStream } from 'node:fs'
import { spawn } from 'node:child_process'
import { pipeline } from 'node:stream/promises'
import { Readable } from 'node:stream'

const DATASET = new URL('../src/data/exercises.json', import.meta.url)
const GIF_DIR = new URL('../.video-work/gifs/', import.meta.url)
const MP4_DIR = new URL('../.video-work/videos/', import.meta.url)
const MANIFEST = new URL('../.video-work/manifest.json', import.meta.url)

const CONCURRENCY = 8
const FFMPEG_ARGS = (input, output) => [
  '-y', '-i', input,
  '-c:v', 'h264_nvenc',
  '-preset', 'p5',
  '-cq', '28',
  '-vf', 'scale=480:-2,fps=24',
  '-movflags', '+faststart',
  '-pix_fmt', 'yuv420p',
  '-an',
  output,
]

async function exists(url) {
  try { await access(url); return true } catch { return false }
}

async function downloadGif(url, dest) {
  if (await exists(dest)) return
  const res = await fetch(url)
  if (!res.ok) throw new Error(`download failed ${res.status} for ${url}`)
  await pipeline(Readable.fromWeb(res.body), createWriteStream(dest))
}

function runFfmpeg(input, output) {
  return new Promise((resolve, reject) => {
    const proc = spawn('ffmpeg', FFMPEG_ARGS(input, output), { stdio: 'ignore' })
    proc.on('error', reject)
    proc.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exited ${code}`))))
  })
}

async function processExercise(ex) {
  const gifPath = new URL(`${ex.slug}.gif`, GIF_DIR)
  const mp4Path = new URL(`${ex.slug}.mp4`, MP4_DIR)
  if (await exists(mp4Path)) return { slug: ex.slug, status: 'skipped' }
  try {
    await downloadGif(ex.gifUrl, gifPath)
    await runFfmpeg(decodeURIComponent(gifPath.pathname.slice(1)), decodeURIComponent(mp4Path.pathname.slice(1)))
    return { slug: ex.slug, status: 'converted' }
  } catch (err) {
    return { slug: ex.slug, status: 'failed', error: err.message }
  }
}

async function pool(items, size, worker) {
  const results = []
  let index = 0
  const runners = Array.from({ length: size }, async () => {
    while (index < items.length) {
      const current = index++
      results[current] = await worker(items[current], current)
      if (current % 25 === 0) console.log(`  ${current}/${items.length}`)
    }
  })
  await Promise.all(runners)
  return results
}

async function main() {
  await mkdir(GIF_DIR, { recursive: true })
  await mkdir(MP4_DIR, { recursive: true })

  const { exercises } = JSON.parse(await readFile(DATASET, 'utf8'))
  console.log(`Converting ${exercises.length} exercises (concurrency ${CONCURRENCY})...`)

  const results = await pool(exercises, CONCURRENCY, processExercise)

  const converted = results.filter((r) => r.status === 'converted').length
  const skipped = results.filter((r) => r.status === 'skipped').length
  const failed = results.filter((r) => r.status === 'failed')

  // Build manifest from whatever MP4s exist on disk.
  const files = (await readdir(MP4_DIR)).filter((f) => f.endsWith('.mp4'))
  const manifest = Object.fromEntries(files.map((f) => [f.replace(/\.mp4$/, ''), f]))
  await writeFile(MANIFEST, JSON.stringify(manifest, null, 2))

  console.log(`\nDone. converted=${converted} skipped=${skipped} failed=${failed.length}`)
  if (failed.length) {
    console.log('Failed slugs:', failed.slice(0, 20).map((f) => f.slug).join(', '))
  }
  console.log(`Manifest: ${files.length} videos -> .video-work/manifest.json`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
