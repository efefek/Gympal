<div align="center">

# GymPal

### Your AI-powered fitness companion for London

A mobile-first fitness web app that builds personalized workout programs, tracks your body and health metrics, and helps you discover gyms, parks, and cycling routes across London.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/tests-72%20passing-success)](#testing)

</div>

---

## Overview

GymPal turns a one-time fitness questionnaire into a living daily companion. Set your goals, equipment, and experience level, and the app generates a tailored training plan — then tracks your progress, body measurements, mood, nutrition, and habits over time. Everything runs **local-first** (no account required to start), with a clean architecture ready for a backend sync layer.

## Features

### Training
- **Personalized program generator** — builds split routines (PPL, full-body, circuit) from your goal, experience, and available equipment
- **1,300+ exercise library** — searchable by muscle group and equipment, with animated demonstrations
- **Interactive workout mode** — set tracking, rest timers, and inline program customization

### Companion Dashboard
- **Body & health tracking** — weight, measurements (waist, arm, chest), BMI, and health vitals
- **Daily tools** — mood journal, habit checklist, to-do and shopping lists, weekly meal planner
- **Visual progress** — SVG charts, gauges, and a monthly activity calendar

### Discovery
- **Interactive maps** — nearby gyms, lidos, parks, and cycling routes across London (Leaflet)

### Experience
- **Light / dark theme** with system-aware switching
- **AI Companion** (in progress) — conversational fitness guidance
- **Social feed** (in progress) — share workouts, unlock achievements, find local events
- **Accessibility-first** — keyboard navigation, ARIA labels, reduced-motion support, WCAG AA contrast

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, TypeScript 5 (strict) |
| Styling | Tailwind CSS v4 |
| Motion | Motion (Framer Motion) |
| Charts | Recharts |
| Maps | Leaflet + React Leaflet |
| Icons | Lucide React |
| Data | Local-first repository pattern over `localStorage` |
| Testing | Vitest + Testing Library (jsdom) |

## Architecture

GymPal follows a **clean, layered architecture** that keeps UI, domain logic, and persistence cleanly separated:

```
src/
├── app/              # App Router pages (home, program, body, social, companion, …)
├── components/       # Reusable UI — feature-organized, accessibility-first
│   ├── dashboard/    # Companion tracking modules
│   ├── body/         # Body & health visualizations
│   ├── companion/    # AI chat interface
│   └── social/       # Community feed
├── lib/
│   ├── storage.ts    # Generic immutable localStorage repository  (createStore<T>)
│   ├── tracker.ts    # Health/body domain: types, stores, CRUD helpers
│   ├── workout.ts    # Program generation engine
│   ├── profile.ts    # User profile + BMI logic
│   └── i18n.ts       # Typed dictionary-based localization
└── data/             # Static datasets (exercises, preset programs)
```

**Key design decisions:**
- **Immutable data flow** — every update returns a new object; no in-place mutation
- **Repository pattern** — all persistence goes through a generic `createStore<T>`, so a future backend (e.g. Supabase) can be swapped in without touching consumers
- **Pure domain logic** — business logic in `lib/` is framework-agnostic and unit-tested
- **Type safety** — TypeScript strict mode throughout; `any` is disallowed

## Getting Started

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Scripts

```bash
npm run dev         # Development server
npm run build       # Production build
npm run lint        # ESLint (flat config + jsx-a11y)
npm run test        # Vitest unit tests
npm run test:watch  # Vitest watch mode
npm run coverage    # Coverage report
```

## Testing

The pure functions in `src/lib/` are the primary test target, covering profile logic, BMI calculation, program generation, and the storage layer.

```bash
npm run test
```

```
Test Files  4 passed (4)
Tests       72 passed (72)
```

Tests follow the Arrange-Act-Assert pattern with descriptive, behavior-focused names.

## Roadmap

- [x] Personalized program generator & exercise library
- [x] Companion dashboard (body, mood, habits, meals)
- [x] Light/dark theme system
- [x] Body & health metric tracking
- [ ] AI Companion with real LLM + RAG over exercise data
- [ ] Social feed with backend (Supabase auth, realtime)
- [ ] Native packaging (Capacitor APK)

## License

This project is private and currently for portfolio purposes.

---

<div align="center">
<sub>Built with Next.js, React, and a focus on clean architecture and accessibility.</sub>
</div>
