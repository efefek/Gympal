# Exercise Video Pipeline

Converts the ~1,300 exercise GIFs into small looping MP4s. Stage 1 (FFmpeg + NVENC)
is deterministic and quality-safe. Stage 2 (AI video) is a future experiment, out of scope here.

## Why

GIFs are large and decode poorly on mobile. H.264 MP4 at the same visual quality is
~70–85% smaller and battery-friendly. The app already falls back to GIF when no video
CDN is configured, so this is a progressive enhancement.

## Stage 1 — FFmpeg NVENC batch (run on the RTX 4090 machine)

### Prerequisites

1. **FFmpeg with NVENC.** Verify the encoder is available:
   ```bash
   ffmpeg -hide_banner -encoders | grep nvenc
   # expect: h264_nvenc
   ```
   On Windows, the official gyan.dev "full" build includes NVENC. Recent NVIDIA driver required.

2. **Node 20+** and this repo checked out, with `src/data/exercises.json` present
   (run `npm run data:sync` first if missing).

### Run

```bash
node scripts/convert-gifs.mjs
```

- Downloads each GIF to `.video-work/gifs/`, encodes to `.video-work/videos/<slug>.mp4`.
- Concurrency is 8; the 4090 will be GPU-bound, not CPU-bound.
- **Resumable** — already-converted slugs are skipped, so it is safe to stop and rerun.
- Writes `.video-work/manifest.json` (slug → filename) at the end.
- Expect roughly 1,300 short clips; wall time is typically well under an hour on a 4090.

Encoder settings (in `convert-gifs.mjs`): `h264_nvenc -preset p5 -cq 28`,
`scale=480:-2`, `fps=24`, faststart, no audio. Tune `-cq` (lower = higher quality/larger).

### Publish

The `.video-work/` folder is local-only (git-ignored). To serve the videos:

1. Create a separate public GitHub repo, e.g. `gympal-videos`.
2. Copy `.video-work/videos/*.mp4` into it and push (consider a tagged release for a stable jsDelivr URL).
3. The jsDelivr base becomes:
   ```
   https://cdn.jsdelivr.net/gh/<user>/gympal-videos@<tag>/videos
   ```
4. Point the app at it via env var (build/runtime):
   ```
   NEXT_PUBLIC_EXERCISE_VIDEO_BASE=https://cdn.jsdelivr.net/gh/<user>/gympal-videos@<tag>/videos
   ```
   `src/components/ExerciseMedia.tsx` will then render `<video>` (looping, muted, autoplay)
   and fall back to the GIF automatically if a clip 404s.

## Stage 2 — AI video (LTX / WAN) — FUTURE / OUT OF SCOPE

Generating exercise demos with a video diffusion model on the 4090 is tempting but risky:
**form accuracy cannot be guaranteed**, and showing a wrong movement is an injury liability.
Tracked separately as an experiment (see MILESTONES M8). Do not wire AI-generated clips into
the app without a human review pass per exercise.
