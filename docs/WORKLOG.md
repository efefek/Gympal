# GymPal — Work Log

---

## 2026-06-12 — Session 1

**What was done:**
- Project bootstrapped with `create-next-app` (Next.js 16.2, React 19, Tailwind v4, TypeScript)
- Dark theme with neon green (#39ff14) accent
- Navbar component (responsive with mobile hamburger menu)
- Hero component (4 feature cards: Exercises, Gyms, Parks, Routes)
- Exercise Library page — fetches 1300+ exercises from MuscleWiki CDN, search + muscle/equipment filters
- Gyms page — Leaflet map + gym/lido cards (static London data)
- Parks page — Leaflet map + park cards
- Bike Routes page — static route cards with difficulty/distance
- MapView component (dark CartoDB tiles, custom glow markers)
- `places.ts` — static London gym, park, and bike route data
- `musclewiki.ts` — MuscleWiki API wrapper with caching
- API route `api/exercises` for server-side fetching
- Waypoint dokümantasyon sistemi kuruldu (docs/)

**Notes:**
- Leaflet markerler için `DynamicMapView` wrapper ile SSR bypass edildi
- ExerciseGrid client-side filtering, URL search params ile senkronize
- Places verisi şimdilik statik, ileride API'den çekilebilir

---

## 2026-06-12 — Session 2

**What was done:**
- Waypoint dokümantasyon sistemi kuruldu (docs/ klasörü + CLAUDE.md güncelleme)
- Build test edildi — sorunsuz
- ExerciseDB API araştırıldı (11k+ exercise, ücretli RapidAPI, MVP için MuscleWiki yeterli)
- ExerciseGrid filtresi iyileştirildi:
  - Search URL params ile senkronize edildi
  - 300ms debounce eklendi
  - Clear button eklendi
  - Filtre sayısı gösterimi eklendi
- Karakter profili sistemi eklendi:
  - `lib/profile.ts` — tipler, localStorage, BMI hesaplama
  - `profile/page.tsx` — 3 adımlı wizard (basics → equipment → summary)
  - Boy, kilo, hedef, tecrübe, ekipman seçimi
  - Home/Gym ayrımı — evde hangi ekipman varsa ona göre filtreleme
- Navbar'a profil linki eklendi
- Hero/profile'e göre kişiselleştirildi (profil varsa karşılama mesajı değişiyor)

**Notes:**
- ExerciseDB V2 ücretli (RapidAPI), M2'de geçiş düşünülebilir
- Profil şimdilik localStorage'da, ileride backend/auth eklenebilir

---

## 2026-06-12 — Session 3

**What was done:**
- ExerciseGrid profil ekipman filtresi düzeltildi:
  - `mapProfileEquipmentToApi()` ile `chair → bodyweight`, `resistance_band → band` eşlemesi
  - "My Equipment" aktifken egzersiz listesi otomatik filtreleniyor
  - Gym seçeneğinde tüm egzersizler gösteriliyor
- Workout program oluşturma motoru (`lib/workout.ts`):
  - Hedefe göre program şablonu (build_muscle→PPL, lose_weight→circuit, vs.)
  - Tecrübeye göre gün sayısı (beginner 3, intermediate 4, advanced 5)
  - Egzersiz seçimi, set/reps/rest atama
- Program sayfası (`/program`):
  - API'den egzersiz çekip profile göre program oluşturma
  - Gün seçici, egzersiz listesi, set/reps/rest gösterimi
  - "Start Day" butonu (timer için hazır)
- Navbar'a Program linki eklendi (en başta, vurgulu)
- Profil kaydı sonrası `/program` sayfasına yönlendirme

---

## 2026-06-12 — Session 4

**What was done:**
- Program sayfası komple yeniden yazıldı:
  - **Calendar** — 7 günlük hafta görünümü, sağ/sol okla hafta değiştirme
  - Bugün olan gün vurgulanıyor, workout günleri yeşil noktayla işaretli
  - Calendar'da güne tıklayınca o günün antrenmanı açılıyor
  - Rest day'ler otomatik algılanıp "Rest day" mesajı gösteriliyor
- **ExerciseCard** — her egzersiz için:
  - GIF animasyonu (100×100)
  - Egzersiz adı, muscle, equipment
  - Set × reps gösterimi
  - Set takibi — her set için checkbox, tamamlananlar yeşil
  - **Rest timer** — her set sonrası countdown, start/pause/reset
- Timer bitince "Rest done" + set otomatik complete
   - Tüm setler bitince egzersiz "Done" etiketi alıyor

---

## 2026-06-12 — Session 5

**What was done:**

- **Timer UI fix** — SetTimer kompakt tek satıra indirildi; "Reset" yazısı kaldırılıp icon-only RotateCcw butonu yapıldı. Play/Pause/Reset artık temiz ve taşma yok.
- **GIF popup** — Egzersiz thumbnail'ine tıklayınca full-size modal açılıyor (siyah overlay + kapatma butonu). Kullanıcı overlay'e veya X'e basınca kapanıyor.
- **Program customisation** — Her ExerciseCard'da edit (Pencil) butonu: sets/reps/rest inline input'a düşüyor, Save ile güncelleniyor. Remove (Trash2) butonu. "Add Exercise" butonu → search input → aday listesi (10 adet, mevcut olmayanlar). Tüm değişiklikler localStorage'a (`gympal-program-custom`) yazılıyor. "Reset to default" bağlantısı ile custom program temizlenip profile göre yeniden oluşturuluyor.
- **Build verification** — `npm run build` başarılı (zero errors/warnings)

**Notes:**
- Custom program localStorage key `gympal-program-custom` — profile'dan bağımsız, istediği zaman resetlenebilir
- Add exercise search mevcut günün egzersizlerini otomatik filtreliyor (duplicate eklenemez)

---

## 2026-06-12 — Session 6 (Kalite & Erişilebilirlik)

**What was done:**

Tüm iş iki paralel Sonnet 4.6 alt-ajanına bölünerek yürütüldü (çakışmayan dosya kümeleri).

- **Test altyapısı** — Vitest 4 + Testing Library + jsdom kuruldu. `vitest.config.ts`, `vitest.setup.ts`. `lib/profile.ts` (26 test) ve `lib/workout.ts` (25 test) için birim testler — 51 test, tamamı geçiyor. Script'ler: `test`, `test:watch`, `coverage`.
- **Lint sıkılaştırma** — `eslint-plugin-jsx-a11y` recommended kurallar flat config'e eklendi. Lint 0 hataya indirildi (7 uyarı: no-img-element, kullanılmayan değişkenler, kasıtlı set-state-in-effect kalıpları).
- **Erişilebilirlik (frontend-a11y skill)** — ikon butonlara `aria-label`; Navbar hamburger `aria-expanded`/`aria-controls`, linklere `aria-current`; GifModal `role="dialog"`+`aria-modal`+Escape+focus restore+erişilebilir backdrop button; Profile formu `fieldset`+`legend`, label `htmlFor`/`id`, toggle'lara `aria-pressed`; arama input'larına sr-only label; takvim/ekipman butonlarına `aria-pressed`/`aria-current`; skip-to-content linki; `prefers-reduced-motion`; `aria-live` durum metinleri; `.sr-only` utility.
- **Error boundary** — `src/app/error.tsx` (App Router, 'use client', reset).
- **Bug düzeltmeleri** — MapView ölü ternary (gym/park artık farklı renk: yeşil/cyan); ExerciseGrid `useEffect` exhaustive-deps; program render-içi `localStorage` → `hasCustom` state (hydration mismatch); autoFocus → callback ref.
- **CLAUDE.md** — stack, komutlar, dizin haritası, kod/a11y/test konvansiyonları eklendi (Waypoint bölümü korundu).
- **Doğrulama** — `npm run test` (51 geçti), `npm run build` (yeşil), `npm run lint` (0 hata).

**Notes:**
- `react-hooks/set-state-in-effect` kasıtlı SSR-güvenli localStorage okuma kalıplarında satır-içi gerekçeli `eslint-disable` ile işaretlendi (config zayıflatılmadı — config-protection hook'una uygun).
- Ana oturum Opus; uygulama işi maliyet için Sonnet alt-ajanlarına devredildi.
- Açık kalan: component testleri, next/image geçişi, renk kontrastı denetimi.

---

## 2026-06-13 — Session 7 (Mobil UI Yeniden Tasarım)

**Hedef:** UI'ı "1997 sitesi" hissinden çıkarıp mobil-app standardına çekmek. Referans: CycleGo / Fitness AI (koyu zemin + neon yeşil — mevcut palet korundu).

**What was done:**
- **Alt tab navigasyonu** — yeni `BottomNav.tsx`: Home · Exercises · merkez FAB (Program/Start) · Maps · Profile. `usePathname` ile aktif sekme, `aria-current`, safe-area padding, `backdrop-blur`. Sadece mobilde (`md:hidden`).
- **Navbar** — mobilde gizlendi (`hidden md:block`), hamburger menü kaldırıldı; masaüstünde üst nav korundu.
- **Ana sayfa (Hero)** — ortalanmış hero yerine mobil dashboard: selamlama header + profil avatarı, "Today's Workout" kartı (SVG progress ring + Continue CTA) / profil yoksa onboarding kartı, 2x2 bento hızlı erişim grid'i. Profile-aware mantık korundu.
- **Program sayfası** — takvim → yatay kaydırmalı pill gün seçici; GifModal → alttan açılan sheet (`slide-up` + drag handle); ExerciseCard `rounded-2xl` + büyük GIF + tap feedback; SetTimer butonları 44px dokunmatik hedefe çıkarıldı.
- **Exercises** — arama `rounded-full`, ekipman çipleri yatay kaydırmaya alındı (dikey dağınıklık giderildi), kartlar `rounded-2xl` + tap-scale, muscle select pill'e çevrildi.
- **Gyms/Parks/Routes** — tutarlı `rounded-2xl` kart + tap feedback + mobil başlık ölçeği.
- **Tasarım token'ları** — `globals.css`: surface katmanları (`--surface-1/2/3`), radius token'ları, `slide-up`/`fade-in` animasyonları, `.tap-scale`, `.scrollbar-hide`, `.safe-bottom`, `.pb-safe-nav`.
- **Layout** — `viewport` export (themeColor, viewportFit cover), main `pb-safe-nav`, BottomNav mount.

**Bug fix:**
- Yatay taşma (mobilde sayfalar sağdan taşıyordu). Kök neden: `<main>` `flex flex-col` iken `max-w-Nxl mx-auto` div'lerde auto-margin stretch'i ezip div'i 1280px'e genişletiyordu. Çözüm: liste sayfa wrapper'larına `w-full` eklendi (Hero zaten içeriyordu). `body { overflow-x: hidden }` güvenlik ağı olarak eklendi. Playwright ile 390px viewport'ta doğrulandı (scrollW === clientW).

**Doğrulama:** `build` yeşil · `lint` 0 hata (7 önceden var olan uyarı) · `test` 51/51 geçti · Playwright mobil ekran görüntüleri (home + exercises) onaylandı.

**Notes:**
- Tüm a11y kazanımları korundu (aria-label, role=dialog, fieldset, skip-link, prefers-reduced-motion üzerine yeni animasyonlar eklendi).
- `lib/` saf fonksiyonları ve testleri değişmedi.
- Sonraki adım: Capacitor ile APK paketleme (output: 'export', API route → client fetch).

---

## 2026-06-13 — Session 8 (Companion App — M7)

**Hedef:** Egzersiz-merkezli siteyi günlük yaşam companion'ına dönüştürmek. Kullanıcı geri bildirimi: "kullanıcı 800 egzersizi görmemeli, profile sayfası gerçek bir dashboard olmalı (BMI, kilo, mood, checklist, todo, alışveriş, yemek, takvim), emoji'ler kalkmalı, tek dil". Plan Fable ile çıkarıldı, uygulama bu session'da yapıldı.

**What was done:**
- **Local-first veri** — `scripts/download-exercises.mjs` ile 1323 egzersiz `src/data/exercises.json`'a indirildi; `musclewiki.ts` CDN fetch yerine yerel import; `src/app/api/exercises/` route silindi; `program/page.tsx` fetch → `getExercises()` import. (M6 static export'a hazırlık.)
- **Veri katmanı** — `src/lib/storage.ts` generic immutable localStorage repository (`createStore<T>`); `src/lib/tracker.ts` weight/mood/checklist/todo/shopping/meal tipleri + CRUD + tarih yardımcıları. Birim testler eklendi (storage 8 + tracker 13 → toplam 72 test).
- **i18n** — `src/locales/en.ts` typed sözlük + `src/lib/i18n.ts`; yeni bileşenler `t.*` kullanıyor. Türkçe ileride tek dosya çevirisi.
- **Hazır programlar** — `src/data/preset-programs.ts`: Home Workout (3 gün), 7-Minute (12 egzersiz circuit), Office Break (mobilite). Bodyweight havuzundan runtime'da kuruluyor (slug kırılganlığı yok).
- **Home (Hero)** — sabit 3 aktivite kartı (Cycling/Running/Strength, emoji yok, lucide ikon), Quick Programs yatay scroll bölümü (preset → localStorage → /program), Explore'dan Exercises çıktı, Bell → Settings ikonu, custom `Logo.tsx`.
- **Companion Dashboard** (`/profile`) — 8 modül `src/components/dashboard/`: BmiCard (yarım daire SVG gauge), WeightChart (SVG sparkline + giriş), MoodTracker (custom SVG yüzler), DailyChecklist (% bar), TodoList/ShoppingList (ortak `CheckableList`), MealPlanner (gün × öğün grid), MiniCalendar (mood/checklist nokta kodu). Hepsi `tracker.ts` store'ları üzerinden, `useMounted` hydration guard'ı ile.
- **Wizard → `/profile/edit`** — mevcut 3 adımlı form taşındı, `equipmentEmoji` → lucide `equipmentIcon` map, kaydet sonrası `/profile` dashboard'a dönüyor.
- **Settings** (`/settings`) — All Exercises, Edit Profile, Reset Program, Clear All Data (onaylı, tüm store'ları temizler), versiyon.
- **Exercises** — ana navigasyondan çıkarıldı (sadece Settings'ten erişilir), 24'lük "Load More" sayfalama (türetilmiş state, ref/effect yok), `ExerciseMedia` bileşeni (video CDN varsa `<video>`, yoksa GIF fallback).
- **Nav** — BottomNav: Home / Maps / Routes / Profile + merkez FAB (program); Navbar: Exercises kaldırıldı, Settings + custom Logo eklendi.
- **Video pipeline** — `scripts/convert-gifs.mjs` (FFmpeg `h264_nvenc`, resumable, manifest) + `scripts/VIDEO_PIPELINE.md` (4090 makinesi kurulum/çalıştırma/jsDelivr publish talimatı). `.video-work/` gitignore'a eklendi. AI video M8'e ertelendi.
- **Emoji sweep** — `equipmentEmoji` export'u kaldırıldı, program buton metinleri temizlendi.

**Doğrulama:** `lint` 0 hata (6 önceden var olan uyarı: img + workout.ts unused) · `test` 72/72 geçti · `build` yeşil (yeni rotalar: /profile/edit, /settings; API route kalktı).

**Notes:**
- Veri repository pattern arkasında soyutlandı — ileride Supabase senkron katmanı consumer'lara dokunmadan eklenebilir.
- `NEXT_PUBLIC_EXERCISE_VIDEO_BASE` env'i set edilince tüm egzersiz görselleri otomatik video'ya geçer, fallback GIF.
- Sonraki adım: video batch'i abinin 4090 makinesinde koşmak + M6 Capacitor APK.

---

## 2026-06-13 — Session 9 (Motion Temeli — Bölüm 0)

**Hedef:** Home + Body "native kalite" motion yeniden inşasının temeli: shared motion sistemi + primitifler.

**What was done:**
- **`src/lib/motion.ts`** — `motionTokens` (duration/ease/distance/spring) + `useMotionVariants()` hook (fadeUp, scaleIn, staggerContainer, sheetVariants) — hepsi `useReducedMotion` fallback'li.
- **`src/app/template.tsx`** — App Router page transition: her route'da `motion.div` fade+slide (reduced-motion guard'lı).
- **`src/components/ui/AnimatedNumber.tsx`** — `useMotionValue` + `useSpring` ile 0'dan sayan animated counter, `.tabular` font-variant.
- **`src/components/ui/ProgressRing.tsx`** — SVG spring-animasyonlu dairesel progress ring (vitals + workout).
- **`src/components/ui/Sheet.tsx`** — `vaul` Drawer sarmalayıcı, themalı glass bottom sheet (drag handle, a11y vaul'dan gelir).
- **`globals.css`** — polish: `html { -webkit-font-smoothing }`, `h1-h3 text-wrap: balance`, `p/li text-wrap: pretty`, `.tabular`, `.glass` utility (backdrop-blur + border), `--r-outer/--r-inner` concentric radius token'ları, `img { outline }` kenar hissi.
- **`src/lib/tracker.ts`** — `getLifetimeStats()` helper: totalWeightKg, activeDays, currentStreak, lastSevenDaysWeights.
- **`src/components/BottomNav.tsx`** — `.glass` nav, motion `layoutId="bottomnav-indicator"` spring spring aktif sekme göstergesi (tap-scale kaldırıldı).

**Doğrulama:** `build` yeşil · `test` 72/72 · TypeScript clean.

**Notes:**
- react-body-highlighter kurulmadı (React 19 peer uyarısı riski) — Bölüm 2'de gerekirse basit SVG siluet fallback.
- Sonraki adım: Bölüm 1 — Hero.tsx yeniden inşası (stagger, featured kart, StatsRow + vaul sheet).

---

## 2026-06-13 — Session 10 (Bölüm 1 — Hero Yeniden İnşa)

**Hedef:** Home ekranını motion stagger + interaktif StatsRow + featured workout kartı ile native-app kalitesine çıkarmak.

**What was done:**
- **`Hero.tsx` komple yeniden yazıldı:**
  - `ActivityScoreGauge` kullanımı kaldırıldı (dosya korundu), `ProgressRing` bileşeni import edildi.
  - `useMotionVariants()` ile `staggerContainer + fadeUp` — tüm bölümler 0.06s aralıklı stagger ile sahneye giriyor.
  - `useEffect` ile mount sonrası `getLifetimeStats()` okunuyor (hydration guard).
  - `WorkoutCard` `whileTap scale 0.98` + Start CTA `whileHover scale 1.02`.
  - Explore grid kartları `whileHover y -2` lift.
  - Quick Programs `whileTap + whileHover` feedback.
  - Tüm renkler CSS değişkenlerine taşındı (Tailwind class yerine `style={{ color: 'var(...)' }}`).
- **`StatsRow.tsx` yeniden yazıldı:**
  - Her kart `motion.button` + `whileTap scale 0.95` — tıklanabilir.
  - `AnimatedNumber` ile 0'dan sayan değerler, `.tabular` font-variant.
  - Tıklamada `vaul` Sheet açılıyor (DistanceSheet / WeightSheet / ActiveSheet).
  - `getLifetimeStats()` verisi: totalWeightKg, activeDays, streak, weightEntries.
- **`src/components/home/StatSheet.tsx` (yeni):**
  - `DistanceSheet`: mock 7 günlük km verisi + recharts `BarChart`.
  - `WeightSheet`: tracker weight log + recharts `LineChart` trend.
  - `ActiveSheet`: haftalık / aylık aktif gün + streak bilgisi.
  - `useStatSheet()` hook — hangi sheet açık state'ini yönetir.

**Doğrulama:** `build` yeşil · `test` 72/72 · TypeScript clean.

**Notes:**
- ease tipi `[number, number, number, number]` tuple olarak tanımlandı (motion/react `Easing` tipi bunu gerektirir).
- recharts Tooltip `formatter` parametresi `ValueType` kabul ediyor, explicit `number` tip cast kaldırıldı.
- Sonraki adım: Bölüm 2 — Body yeniden inşası (SVG siluet, MeasurementSheet, MetricChart, VitalsGrid).

---

## 2026-06-13 — Session 10 (Body Sayfası Yeniden İnşası — Bölüm 2)

**Hedef:** Body sayfasını "Log Measurements düz buton" düzeyinden interaktif, native-hissli dashboard'a çıkarmak.

**What was done:**
- **`src/components/body/BodyCharacter.tsx`** — SVG vücut silueti (react-body-highlighter yerine; React 19 uyumu). 4 bölge (chest/arms/waist/legs) tıklanabilir, ölçümü girilmiş bölgeler primary yeşille dolup kalkıyor. `motion.path` whileTap scale feedback.
- **`src/components/body/MeasurementSheet.tsx`** — vaul tabanlı form sheet: Weight/Height/Arm/Waist/Chest/Body Fat alanları, `logMeasurement()` ile kayıt, ilk ölçüm detection (confetti hook için).
- **`src/components/body/MetricChart.tsx`** — recharts LineChart ile ölçüm trendi. 1W/1M/3M/1Y range tab'ları. Kilo/Bel/Kol filtre çipleri. Animated çizgi, themalı tooltip.
- **`src/components/body/VitalsGrid.tsx`** — 4 vital kartı (Su/Protein/Adım/Kalp). Her kartda `ProgressRing` + `AnimatedNumber` (0'dan sayar).
- **`src/app/body/page.tsx`** — Komple yeniden yazıldı: `staggerContainer`/`fadeUp` motion stagger, BodyCharacter + 5 stat (weight/height/bmi/waist/arm), MetricChart, VitalsGrid, sticky "Log Measurements" CTA (motion whileTap).

**Doğrulama:** `build` yeşil · `test` 72/72 geçti · TypeScript clean.

**Notes:**
- SVG siluet fallback seçildi (react-body-highlighter React 19 peer uyumsuzluğu riski). Bölgeler `filledRegions` prop'u ile highlight; tıklanınca sheet açılıyor.
- M9 milestone ✅ Done olarak işaretlendi.

---

## 2026-06-13 — Session 11 (Swiss Monokrom Yeniden Tasarım — Home + Body)

**Hedef:** Önceki pasın görsel sonucu kötüydü (neon yeşil/siyah şablon hissi, sahte veri, Body'de üst üste binen yazılar + BMI 495.9 + "yeşil leke" karakter). Kullanıcı kararları: Playwright ile görerek iterasyon; Swiss/International monokrom tema (dark + light, gradient/glow/neon yok, primary = mürekkep-ters buton); Body'de karakter yok → ölçüm listesi; Companion'a dokunma.

**What was done:**
- **Tasarım sistemi** (`globals.css`) — neon-yeşil/gradient/glow token'ları kaldırıldı, monokrom Swiss sistemine geçildi: `--ink`/`--ink-text` (mürekkep-ters primary), `--accent` (tek nadir vurgu, #FF5C00), düz `--surface` katmanları. Eski `--primary*` → `--ink`/`--accent` alias'landı (37 dosya tek dosyada yeşilden çıktı). `.btn-ink` utility. `.glass` sadeleşti, `glow-pulse` silindi.
- **Home** (`Hero.tsx`) — Swiss editorial: dev tipografik header, düz "Today's Plan" kartı (gradient/glow yok, `.btn-ink` CTA, "0%" mono sayı), numaralı 01/02/03 stat kartları. **Sahte Distance kaldırıldı** → gerçek 3 stat: Streak / Active / Weight (son girdi). Mono day pills (today = ink-ters). "My Activity" yeşil-gradient bölümü silindi. Zıplama fix: mount öncesi sabit-yükseklik skeleton.
- **StatsRow + StatSheet** — `MOCK_DISTANCE`/`DistanceSheet` silindi; Streak/Active/Weight sheet'leri gerçek veriyle; grafikler mono (`--foreground`).
- **tracker.ts** — `getLifetimeStats`'a `currentWeightKg` (son girdi) eklendi; anlamsız `totalWeightKg` toplamı Home'dan düşürüldü.
- **Body** (`body/page.tsx`) — **karakter silindi**; temiz ölçüm listesi (Weight/Height/Waist/Arm/Chest/Body Fat — satır + dev mono değer + birim + ok). Satıra tap → o alana **odaklı** sheet. **BMI sanity bound** (weight 20–400, height 50–250 dışı → "—"); mevcut `calcBMI` yeniden kullanıldı. Sticky `.btn-ink` CTA.
- **MeasurementSheet** — `focusField` prop (autoFocus) + input validasyonu (aralık dışı reddedilir, accent renkli hata). 495.9 saçmalığı bitti.
- **MetricChart / VitalsGrid / ProgressRing / BottomNav / Sheet** — mono restyle (ink/accent, yeşil glow kaldırıldı). `BodyCharacter.tsx` silindi.

**Playwright self-review (390px):** Home dark/light + Body dark/light ekran görüntüleriyle doğrulandı — üst üste binme yok, taşma yok, yeşil kalıntı yok. Body'ye 75kg/180cm girildi → **BMI 23.1 · Normal** (doğru), liste temiz doldu, trend grafiği çizdi, odaklı sheet açıldı.

**Doğrulama:** `lint` 0 hata (7 önceden var olan uyarı) · `test` 72/72 · `build` yeşil.

**Notes:**
- Companion bu pasta kod olarak korundu; tema token'ları değişince mono'ya döndü (kullanıcı içeriği beğenmişti).
- `--accent` tek satırda değiştirilebilir; canlı gösterilip onaya açık.
- Sonraki adım: kullanıcı geri bildirimine göre ince ayar; sonra Social/Program aynı Swiss dile.
