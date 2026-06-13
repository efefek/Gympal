# GymPal — Decisions

| # | Decision | Rationale | Date |
|---|----------|-----------|------|
| 1 | Leaflet dynamic import (`next/dynamic`) | Leaflet uses `window`, breaks SSR. Dynamic import with `ssr: false` solves this. | 2026-06-12 |
| 2 | Client-side filtering for exercises | Server-side filtering would require re-fetching; CDN data is small enough (1300 items) for client filter. URL params keep state shareable. | 2026-06-12 |
| 3 | Static places data instead of API | MVP scope — small dataset (<20 items). Easy to swap with real API later. | 2026-06-12 |
| 4 | Neon green accent (#39ff14) | Gym/fitness theme, high contrast on dark bg, fits "glow" aesthetic. | 2026-06-12 |
| 5 | MuscleWiki CDN via jsdelivr | Free, no API key needed, version-pinned, cached in memory per session. | 2026-06-12 |
