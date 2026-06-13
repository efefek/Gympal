# GymPal — Milestones

**Start:** June 2026

| Milestone | Status | Target |
|-----------|--------|--------|
| M1 — MVP London Fitness Companion | 🔄 In Progress | — |
| M2 — Character Profile & Smart Filtering | ✅ Done | — |
| M4 — Quality & Accessibility | 🔄 In Progress | — |
| M5 — Mobil UI Yeniden Tasarım | ✅ Done | — |
| M7 — Companion App | ✅ Done | — |
| M9 — Native Motion (Home + Body) | ✅ Done | — |
| M6 — APK Paketleme (Capacitor) | ⏳ Planlandı | — |
| M8 — AI Video (LTX/WAN) Deneyi | 💡 Fikir | — |

---

## M4 — Quality & Accessibility

**Goal:** Production-grade kalite: erişilebilirlik (WCAG), test altyapısı, lint sıkılaştırma.

### Tasks — M4

- [x] eslint-plugin-jsx-a11y kuruldu ve flat config'e eklendi
- [x] Vitest + Testing Library kuruldu (vitest.config.ts, setup)
- [x] lib/workout.ts ve lib/profile.ts birim testleri (51 test, geçiyor)
- [x] CLAUDE.md zenginleştirildi (stack, komutlar, dizin haritası, konvansiyonlar)
- [x] A11y: ikon butonlara aria-label, mobil menü aria-expanded/controls
- [x] A11y: GifModal role=dialog + aria-modal + Escape + focus restore + erişilebilir backdrop
- [x] A11y: form label htmlFor/id, profile fieldset+legend, aria-pressed toggle'lar
- [x] A11y: skip-to-content linki, prefers-reduced-motion, aria-live durum metinleri
- [x] App Router error boundary (src/app/error.tsx)
- [x] Bug: MapView ölü ternary (gym/diğer aynı renk) düzeltildi
- [x] Bug: ExerciseGrid useEffect exhaustive-deps düzeltildi
- [x] Bug: program render-içi localStorage → state (hydration mismatch)
- [x] Lint yeşil (0 hata), build yeşil
- [ ] Component testleri (ExerciseGrid filtre, Navbar) — opsiyonel
- [ ] next/image geçişi (img-element uyarıları)
- [ ] Renk kontrastı denetimi (zinc-600/700)

---

## M7 — Companion App

**Goal:** Egzersiz-merkezli siteden günlük yaşam companion'ına geçiş. Antrenman motoru arka plana, sağlık + günlük düzen modülleri öne. Local-first veri, i18n altyapısı, emoji temizliği.

### Tasks — M7

- [x] Local-first veri: `scripts/download-exercises.mjs` + `src/data/exercises.json` (1323 egzersiz), API route silindi
- [x] `src/lib/storage.ts` generic localStorage repository (immutable, SSR-safe) + testler
- [x] `src/lib/tracker.ts` — weight/mood/checklist/todo/shopping/meal tipleri + CRUD + testler (72 test toplam)
- [x] i18n altyapısı: `src/locales/en.ts` + `src/lib/i18n.ts` (tek sözlük, ileride tr.ts)
- [x] `musclewiki.ts` CDN fetch → yerel JSON import
- [x] Hazır programlar: `src/data/preset-programs.ts` (Home / 7-Minute / Office Break, bodyweight havuzundan)
- [x] Hero: sabit aktivite kartları, Quick Programs bölümü, Settings ikonu, Explore'dan Exercises çıktı
- [x] Companion dashboard (`/profile`): BMI gauge, kilo grafiği, mood (custom SVG), checklist, todo, shopping, meal planner, mini takvim
- [x] Wizard → `/profile/edit` taşındı, emoji → lucide ikon
- [x] `/settings`: All Exercises, Edit Profile, Reset Program, Clear All Data
- [x] ExerciseGrid sayfalama (24'lük Load More) + ExerciseMedia (video/GIF fallback)
- [x] Nav: BottomNav (Home/Maps/Routes/Profile + FAB), Navbar (Settings + custom Logo)
- [x] Video pipeline: `scripts/convert-gifs.mjs` (FFmpeg NVENC) + `VIDEO_PIPELINE.md`
- [x] Emoji sweep (equipmentEmoji kaldırıldı, buton metinleri temizlendi)
- [x] lint 0 hata · test 72/72 · build yeşil

## M8 — AI Video (LTX/WAN) Deneyi

**Goal:** Egzersiz demolarını 4090'da AI video ile üretme deneyi. Risk: form doğruluğu garanti edilemez — her egzersiz için insan review şart. Uygulamaya bağlanmadan önce doğrulama.

### Tasks — M8

- [ ] LTX-Video / WAN pipeline POC (birkaç örnek egzersiz)
- [ ] Form doğruluğu değerlendirmesi (insan review)
- [ ] Karar: ürüne alınır mı yoksa FFmpeg dönüşümü mü kalır

## M5 — Mobil UI Yeniden Tasarım

**Goal:** UI'ı mobil-app standardına çekmek (CycleGo referansı, neon yeşil palet korundu). Touch-friendly, alt navigasyon, modern kartlar.

### Tasks — M5

- [x] Alt tab navigasyonu (BottomNav) + merkez FAB
- [x] Navbar mobilde gizlendi, masaüstüne bırakıldı
- [x] Ana sayfa mobil dashboard (header + workout kartı + progress ring + bento grid)
- [x] Program: pill gün seçici + sheet GifModal + dokunmatik kart/timer
- [x] Exercises: rounded-full arama, yatay kaydırmalı filtre çipleri, tap-scale kartlar
- [x] Gyms/Parks/Routes: tutarlı rounded-2xl kart + tap feedback
- [x] Tasarım token'ları (surface katmanları, radius, animasyonlar, safe-area)
- [x] Yatay taşma bug fix (flex + mx-auto → w-full), Playwright doğrulama

## M6 — APK Paketleme (Capacitor)

**Goal:** Mobil UI'ı Android APK olarak paketlemek.

### Tasks — M6

- [ ] API route → client-side CDN fetch (statik export uyumu)
- [ ] next.config: `output: 'export'`, `images.unoptimized`
- [ ] Capacitor kurulumu + `cap add android`
- [ ] `gradlew assembleDebug` → APK üretimi ve cihaz testi

---

## M1 — MVP London Fitness Companion

**Goal:** Fully functional Next.js app with 4 feature pages, interactive map, exercise library with GIF demos.

### Tasks — M1

- [x] `create-next-app` bootstrapping
- [x] Tailwind CSS v4 + dark theme (neon green accent)
- [x] Navbar component with responsive mobile menu
- [x] Hero/landing page with feature cards
- [x] Exercise Library page (MuscleWiki API, search, filter by muscle/equipment)
- [x] Nearby Gyms page (Leaflet map, place cards)
- [x] Parks page (Leaflet map, place cards)
- [x] Bike Routes page (static data, difficulty/distance badges)
- [x] Leaflet map component (dark tiles, custom markers)
- [x] API route for exercises proxy
- [x] Exercise filtering polish (search URL sync, debounce, clear button)
- [x] Build verification (`npm run build`)
- [ ] Responsive polish & edge cases
- [ ] Deployment prep

---

## M2 — Character Profile & Smart Filtering

**Goal:** Personalised experience based on user's body metrics, goals, and available equipment.

- [x] Profile data model & localStorage
- [x] Exercise filtering polish (search URL sync, debounce, clear button)
- [x] Profile-aware hero page
- [x] Navbar profile link
- [x] Profile-based equipment filter in ExerciseGrid (auto-filter by user equipment)
- [x] Goal-based workout program generation (Push/Pull/Legs, Full Body, HIIT, etc.)
- [x] Program screen with day-by-day view, sets/reps/rest
- [x] Workout timer & set tracking (rest timer per set, complete/reset)
- [x] Timer UI cleanup — compact row, icon-only reset, no stray text
- [x] GIF popup — click thumbnail → full-size modal overlay
- [x] Program customisation — edit sets/reps/rest inline, remove/add exercises, persist to localStorage
- [ ] Lap repeater

## M3 — Future Ideas

- [ ] Workout timer & lap repeater
- [ ] London events discovery (marathons, races)
- [ ] Strava integration
- [ ] Google Health / Health Connect
- [ ] User authentication (saved workouts, favorites)
- [ ] Route mapping with polyline on Leaflet
- [ ] Search by location (geolocation)
- [ ] PWA / offline support
