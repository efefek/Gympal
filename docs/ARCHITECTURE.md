# GymPal — Architecture

## Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16.2.9 (App Router) |
| UI Library | React 19 |
| Styling | Tailwind CSS v4 |
| Maps | Leaflet + react-leaflet (dynamic import) |
| Icons | lucide-react |
| Data (Exercises) | MuscleWiki CDN (jsdelivr) |
| Data (Places) | Static TS module (`places.ts`) |
| Font | Geist (next/font) |

## Directory Structure

```
src/
├── app/
│   ├── api/exercises/route.ts   — Exercises API proxy
│   ├── exercises/               — Exercise Library (filters, grid)
│   ├── gyms/                    — Nearby Gyms (map + cards)
│   ├── parks/                   — Parks (map + cards)
│   ├── routes/                  — Bike Routes (cards)
│   ├── globals.css              — Theme & animations
│   ├── layout.tsx               — Root layout + Navbar
│   └── page.tsx                 — Hero landing page
├── components/
│   ├── DynamicMapView.tsx       — SSR-safe dynamic map wrapper
│   ├── Hero.tsx                 — Landing page hero
│   ├── MapView.tsx              — Leaflet map implementation
│   └── Navbar.tsx               — Top navigation bar
└── lib/
    ├── musclewiki.ts            — MuscleWiki API client (cached)
    └── places.ts                — Static London places data
```

## Data Flow

### Exercise Library
```
Page (Server) → getExercises() → MuscleWiki CDN (cached)
              → ExerciseGrid (Client) → search/filter → URL params sync
```

### Maps
```
Page (Server) → places.ts data
              → DynamicMapView (Client, dynamic) → MapView → Leaflet
```

## Routing

| Route | Page | Type |
|-------|------|------|
| `/` | Hero/Landing | Static |
| `/exercises` | Exercise Library | Server + Client |
| `/gyms` | Nearby Gyms | Server + Client (map) |
| `/parks` | Parks | Server + Client (map) |
| `/routes` | Bike Routes | Static |

## Theme

- Dark background (#000), light text (#e4e4e7)
- Primary: neon green (#39ff14) with glow effects
- Cards: zinc-900 bg, zinc-800 border
- Glow pulse and fade-in-up animations
