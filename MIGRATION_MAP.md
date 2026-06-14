# GymPal — Migration Map (Next.js Web → React Native + Expo)

> Faz 0 çıktısı — SALT ANALİZ. Kaynak: `C:\Users\kosee\Projects\gympal-legacy` (eski web, sadece okundu).
> Hedef: `C:\Users\kosee\Projects\gympal` (Expo SDK 56, expo-router, TS).
> Tarih: 2026-06-14. Bu belge onaylanmadan Faz 1'e (eşleştirme tablosu) geçilmeyecek.

---

## 0. Teknoloji Özeti (eski web)

- **Next.js 16.2.9** App Router + React 19.2 + TypeScript 5
- **Tailwind v4** (`@tailwindcss/postcss`) + CSS custom properties (tek tema dosyası `globals.css`)
- **motion v12** (`motion/react`) — gesture pager, drag, stagger, layout animasyonu
- **next-themes** — `data-theme` attribute, `defaultTheme="dark"`, `enableSystem={false}`
- **leaflet + react-leaflet** — harita (yalnız client, `ssr:false`)
- **recharts v3** — trend/grafik
- **lucide-react v1** — ikonlar
- **vaul** — bottom sheet (Sheet bileşeni)
- **canvas-confetti** — kutlama efekti
- **Veri**: %100 client-side, **zero-backend**. Egzersiz DB build-time bundle (`src/data/exercises.json`), kullanıcı verisi `localStorage`.
- **Test**: Vitest + Testing Library + jsdom

---

## 1. Route / Sayfa Yapısı (App Router)

| Route | Dosya | Ne yapar |
|-------|-------|----------|
| `/` | `app/page.tsx` → `components/bunker/BunkerPage.tsx` | **Bunker** — gesture pager, 2 panel |
| `/body` | `app/body/page.tsx` | Vücut sağlığı: Body Count (BMI), Trend grafiği, Vital log'ları |
| `/social` | `app/social/page.tsx` | Topluluk: feed / discover / events (mock veri) |
| `/profile` | `app/profile/page.tsx` | **"Dashboard"** — companion widget'ları (mood, checklist, todo, shopping, meal, calendar, weight, bmi) |
| `/profile/edit` | `app/profile/edit/page.tsx` | 4 adımlı onboarding/profil formu (basics→diet→equipment→summary) |
| `/companion` | `app/companion/page.tsx` | AI sohbet (mock cevap motoru, in-memory geçmiş) |
| `/program` | `app/program/page.tsx` | Program detayı + gün seçici + **aktif antrenman** (set/timer/GIF) |
| `/settings` | `app/settings/page.tsx` | Ayarlar: exercises'a git, profili düzenle, programı sıfırla, tüm veriyi sil |
| `/exercises` | `app/exercises/page.tsx` + `ExerciseGrid.tsx` | 1323 egzersizli arama/filtre grid (server component + searchParams) |
| `/gyms` | `app/gyms/page.tsx` | Leaflet harita + spor salonu kartları (London) |
| `/parks` | `app/parks/page.tsx` | Leaflet harita + park kartları (gyms ile aynı şablon) |
| `/routes` | `app/routes/page.tsx` | Bisiklet rotaları kart grid'i (harita yok) |
| — | `app/layout.tsx` | Root: ThemeProvider, Navbar (desktop), BottomNav (mobil), ThemeToggle, skip-link |
| — | `app/template.tsx`, `app/error.tsx` | Sayfa geçiş template'i + hata sınırı |

---

## 2. Navigasyon Akışı

### Mobil — `BottomNav.tsx` (`md:hidden`, alt sabit bar)
Sıra: **Bunker (`/`) · Body (`/body`) · [FAB → Companion `/companion`] · Social (`/social`) · Profile (`/profile`)**
- FAB ortada, yukarı taşmış (`-mt-8`), `Sparkles` ikonu, `btn-ink`.
- Aktif sekme arkasında `motion` `layoutId="bottomnav-indicator"` kayar gösterge.

### Desktop — `Navbar.tsx` (`md:block`, üst sticky bar)
Logo · **Program** · **Gyms** · **Parks** · **Routes** · **Profile** · **Settings** · ThemeToggle

### ⚠️ ÖNEMLİ UYUMSUZLUK (onay gerektirir)
Görev brief'inde **"BottomNav: Bunker, Body, Maps, Social, Profile + FAB"** denmiş.
Gerçek kodda mobil alt barda **Maps YOK**. Harita sayfaları (`/gyms`, `/parks`, `/routes`) yalnızca **desktop Navbar**'da var; mobilde bunlara doğrudan bottom-nav girişi **bulunmuyor** (sadece dolaylı erişim mümkün değil — mobilde pratikçe ulaşılamaz durumdalar).
→ **Native'de karar gerek**: "Maps" sekmesi bottom nav'a eklensin mi (5 sekme + FAB), yoksa harita bir başka ekrana mı gömülsün? Sosyal "discover" sekmesinde de "Map view coming soon" placeholder'ı var.

### Ekran-içi geçişler
- **Bunker takvim**: bugünün gününe dokun → `/program`. Hafta şeridi **yatay swipe** ile değişir (ok yok).
- **Bunker "Continue workout"** → `/program`. Profil yoksa → `/profile/edit`.
- **Bunker swipe-up** → Program paneli (panel 1). Panel'deki gün kartları → `/program`.
- `/profile`: "Edit profile" → `/profile/edit`; ayar ikonu → `/settings`.
- `/settings`: → `/exercises`, `/profile/edit`; "reset program" → `/program`; "clear data" → `/`.
- `/program`: "Regenerate from Profile" → `/profile`.
- `/exercises`: geri → `/settings`.

---

## 3. Sayfa Bazında Business Logic

### `/` Bunker (`BunkerPage.tsx` + `PanelPager.tsx`)
- **PanelPager**: dikey gesture pager. Swipe-up → sonraki panel (mevcut yukarı kayar + scale-down + fade-out; yeni alttan scale+fade-in). Swipe-down → geri. Tümü **ease-in-out** `[0.45,0,0.55,1]` (`motionTokens.ease.inOut`). Eşikler: `SWIPE_OFFSET=70`, `SWIPE_VELOCITY=400`. Panel-içi öğeler **staggered** (`panelChildVariants`, stagger 0.07, delayChildren 0.12). `prefers-reduced-motion` → sadece fade, drag kapalı.
- **Panel 0 (Dashboard)**: mount'ta `getProfile()`, `loadProgram()`, `getLifetimeStats()` okunur. İçerik: ayar ikonu + `0X/0Y` sayaç → "Bunker" mikro-etiket + dev "Hi there" hero → stats satırı (Weight/Streak/Active, pastel noktalı) → **This week takvim** (7 gün, bugün `btn-ink`, antrenman günleri pastel nokta, yatay swipe ile `weekOffset` ±1) → Today's Plan (gün adı, egzersiz sayısı, süre, "Continue workout") → alta swipe-up "Program" ipucu (zıplayan chevron).
- **Panel 1 (Program)**: `program.days` → **numaralı pastel daireler** (01/02/03…, metro-hattı), bugünün günü vurgulu (pastel border + surface-2). "Edit full program" → `/program`. Program yoksa "No program" + create CTA.
- Bugünün günü: `todayDayData()` — `getDay()` Pzt-başı index'e çevrilir, `% daysPerWeek`.

### `/body` (`body/page.tsx`)
- **Body Count**: bugünün ölçümü ya da son ölçüm + profil fallback ile **BMI** hesabı (`calcBMI`, `bmiCategory`). Geçerlilik aralığı: ağırlık 20–400 kg, boy 50–250 cm. Tıkla → `MeasurementSheet`.
- Quick metrikler: Weight / Height / Waist / Body Fat — her biri ölçüm sheet'ini açar.
- **Trend**: `MultiTrendChart` (recharts) — ölçüm + vital serileri, çoklu seçim (pastel çizgiler + legend) — vizyondaki "aynı anda birden çok seri" hedefi.
- **Logs**: 4 vital (Water/Protein/Food/Steps). Karta dokun → period döngüsü (day→week→month, `vitalAgg` ile toplama). `+` → `VitalLogSheet`: preset butonları (ör. Water 250/500/1000ml) **mevcut değerin üstüne ekler**, ya da `NumberScrubber` ile custom set. "Log Measurement" → tam ölçüm sheet'i.

### `/profile` ("Dashboard" — `profile/page.tsx`)
- `getProfile()` ile özet kartı (goal·experience, boy/kilo, BMI accent renkli) ya da onboarding CTA.
- Canlı kilo: `WeightChart` `onLogged` callback ile anlık güncellenir (`liveWeightKg`).
- Widget'lar (hepsi `lib/tracker` store'larını kullanır): `BmiCard`, `WeightChart`, `MoodTracker`, `DailyChecklist`, `TodoList`, `ShoppingList`, `MealPlanner`, `MiniCalendar`.

### `/profile/edit` (`profile/edit/page.tsx`)
- 4 adım: **basics** (boy/kilo NumberField, goal & experience ChoiceGroup) → **diet** (diyet/dislike/allergen textarea + günlük su/protein hedefi) → **equipment** (location home/gym; home ise 14 ekipman çoklu seçim) → **summary** (özet satırları).
- Mount'ta mevcut profil prefill. Kaydet → `saveProfile()` → 700ms sonra `/profile`. Reset → `clearProfile()`.
- Not: Bu ekran hâlâ **brutalist** stil kullanıyor (`border-[3px]` foreground çerçeve) — globals.css'in geçtiği "tek Swiss yüzey" dilinden sapıyor; native'de Swiss/editorial'e hizalanacak.

### `/companion` (`companion/page.tsx` + `lib/companion.ts`)
- Mock sohbet: `getMockResponse()` anahtar-kelime eşleşmesiyle sabit cevaplar döner (program/goal/exercise/today + rastgele default'lar). 500ms gecikmeli "typing".
- Geçmiş **in-memory** (`messageHistory`, MAX 20) — **localStorage'a yazmaz**, sayfa yenilenince sıfırlanır.

### `/program` (`program/page.tsx`)
- Mount: profil yoksa boş durum. Varsa `getExercises({limit:500})` → location'a göre havuz filtreler (home: yalnız bodyweight+band). Custom program varsa `gympal-program-custom`'dan yükler; yoksa `generateProgram()` üretir.
- **Düzenleme**: egzersiz ekle/çıkar/edit (sets/reps) → her değişiklik `saveCustom()` ile `localStorage`'a yazar (custom flag set edilir).
- Gün seçici: hafta şeridi (`weekOffset`), gün seç → o günün egzersiz listesi (numaralı satırlar, GIF modal, edit/remove).
- **ActiveWorkoutView**: tam ekran, tek egzersiz; set tamamlama, set göstergeleri, `useTimer` ile dinlenme sayacı (`SetTimer`), GIF modal, skip/next/finish.
- `generateProgram` (`lib/workout.ts`): goal+experience+location'a göre gün sayısı (3/4/5) ve gün şablonları; bodyPart bazlı egzersiz seçimi (tekrarsız), goal'a göre set/rep/rest ataması.

### `/settings` (`settings/page.tsx`)
- "All exercises" → `/exercises`. "Edit profile" → `/profile/edit`.
- **Reset program**: `gympal-program-custom` siler → `/program`.
- **Clear all data**: confirm sonrası `clearProfile()` + program key + 6 tracker store (`weightStore, moodStore, checklistStore, todoStore, shoppingStore, mealStore`) temizler → `/`. **Not: `measurementStore` ve `vitalStore` bu temizlikte UNUTULMUŞ** (potansiyel bug — native'de tüm key'ler temizlenmeli).
- Versiyon sabiti `APP_VERSION = '0.2.0'`.

### `/exercises` (`exercises/page.tsx` + `ExerciseGrid.tsx`)
- **Server component**: `searchParams` (search/equipment/muscle) ile `getExercises()` + `getEquipment()` paralel çağrı; ekipman filtre çipleri üretilir; grid'e geçer.
- Native'de server-component yok → client-side filtre + URL state'e dönecek.

### `/gyms`, `/parks`, `/routes`
- `/gyms`, `/parks`: `DynamicMapView` (Leaflet, `ssr:false`) + yatay kaydırmalı kart listesi. Veri `lib/places.ts` (sabit, London).
- `/routes`: harita yok, sadece bisiklet rotası kart grid'i.

---

## 4. localStorage State Şeması (BİREBİR KORUNACAK)

Tüm key'ler `gympal-` öneki. Tracker key'leri `lib/storage.ts` generic store (dizi tabanlı, her item `{id}`'li). Profil ve program tekil obje.

| Key | Tür | Şekil | Kaynak |
|-----|-----|-------|--------|
| `gympal-profile` | obje | `UserProfile` | `lib/profile.ts` |
| `gympal-program-custom` | obje | `WorkoutProgram` | `lib/program-store.ts` |
| `gympal-weight-log` | dizi | `WeightEntry[]` | `lib/tracker.ts` |
| `gympal-mood` | dizi | `MoodEntry[]` | `lib/tracker.ts` |
| `gympal-checklist` | dizi | `ChecklistItem[]` | `lib/tracker.ts` |
| `gympal-todos` | dizi | `TodoItem[]` | `lib/tracker.ts` |
| `gympal-shopping` | dizi | `ShoppingItem[]` | `lib/tracker.ts` |
| `gympal-meals` | dizi | `MealEntry[]` | `lib/tracker.ts` |
| `gympal-measurements` | dizi | `BodyMeasurement[]` | `lib/tracker.ts` |
| `gympal-vitals` | dizi | `HealthVital[]` | `lib/tracker.ts` |
| `theme` | string | `next-themes` ("dark"/"light") | `next-themes` default |

### Tip tanımları (birebir)

```ts
// UserProfile (gympal-profile)
interface UserProfile {
  height: number; weight: number;
  goal: 'lose_weight'|'build_muscle'|'general_fitness'|'flexibility'|'endurance';
  experience: 'beginner'|'intermediate'|'advanced';
  equipment: EquipmentType[];   // 14 değer: bodyweight, dumbbell, barbell, kettlebell,
                                //   resistance_band, cable, machine, chair, yoga_mat,
                                //   ez_bar, lever, sled, smith, other
  location: 'home'|'gym';
  dietaryPreferences?: string; foodDislikes?: string; allergens?: string;
  dailyWaterMlTarget?: number;  // default 2500
  dailyProteinGTarget?: number; // default 150
}

// WorkoutProgram (gympal-program-custom)
interface WorkoutProgram { name: string; description: string; daysPerWeek: number; days: WorkoutDay[] }
interface WorkoutDay { name: string; focus: string; exercises: WorkoutExercise[]; estDuration: string }
interface WorkoutExercise extends Exercise { sets: number; reps: string; rest: string; order: number }

// Tracker dizileri
interface WeightEntry { id: string; date: string /*YYYY-MM-DD*/; kg: number }
type MoodLevel = 1|2|3|4|5
interface MoodEntry { id: string; date: string; level: MoodLevel }
interface ChecklistItem { id: string; label: string; doneDates: string[] }
interface TodoItem { id: string; text: string; done: boolean; createdAt: string /*ISO*/ }
interface ShoppingItem { id: string; text: string; done: boolean; createdAt: string }
type MealSlot = 'breakfast'|'lunch'|'dinner'|'snack'
interface MealEntry { id: string /*`${day}-${slot}`*/; day: number /*0=Mon..6=Sun*/; slot: MealSlot; text: string }
interface BodyMeasurement { id: string; date: string; weight?; height?; armCirc?; thighCirc?; waistCirc?; bodyFat?; chest? }
interface HealthVital { id: string; date: string; heartRate?; bloodPressureSys?; bloodPressureDia?; waterMl?; proteinG?; foodKcal?; steps? }
```

### Store soyutlaması (KRİTİK — taşımayı kolaylaştırır)
`lib/storage.ts` tek bir generic `createStore<T>(key)` sağlıyor (get/set/add/update/remove/clear, hepsi immutable, SSR-safe). **Tüm tracker erişimi bu arayüzden geçiyor; bileşenler localStorage'a doğrudan dokunmuyor.** → Native'de yalnız bu dosyanın iç gövdesi MMKV'ye çevrilecek; **key isimleri, veri şekli ve fonksiyon imzaları aynen kalacak**. `profile.ts` ve `program-store.ts` localStorage'a doğrudan erişiyor (store kullanmıyor) — bunlar da MMKV'ye birebir uyarlanacak.

### Tarih/yardımcı kurallar
- `todayKey()` / `toLocalDateString()`: `YYYY-MM-DD` **lokal** (UTC değil).
- Hafta **Pazartesi başlangıçlı** (`getWeekDates`, `todayWeekIndex` 0=Pzt..6=Paz).
- Upsert kuralı: weight/mood/measurement/vital günde **tek kayıt** (aynı tarih varsa güncelle). Meal hücresi `${day}-${slot}` tekil.
- `id`: `crypto.randomUUID()` (yoksa timestamp+random fallback). Native'de `crypto.randomUUID` RN'de yok → polyfill/`expo-crypto` veya mevcut fallback kullanılacak.

---

## 5. Egzersiz Verisi (MuscleWiki yerine yerel)

- Kaynak artık CDN değil: **`src/data/exercises.json`** build-time bundle (`import data from '@/data/exercises.json'`).
- **1323 egzersiz**, dosya ~928 KB. JSON kökü: `{ count: number, exercises: Exercise[] }`.
- `lib/musclewiki.ts` API:
  - `getExercises({ limit?, search?, equipment?, muscle?, bodyPart? })` → `{ exercises }` (in-memory filtre; search = isim içinde arama, diğerleri tam eşleşme).
  - `getEquipment()` → benzersiz ekipman listesi (sıralı).
- `Exercise` şekli:
  ```ts
  interface Exercise {
    id: string; slug: string; name: string; muscle: string; bodyPart: string;
    equipment: string; category: string; secondaryMuscles: string[];
    instructions: string[]; gifUrl: string;
  }
  ```
  (JSON'da ayrıca `file` alanı var; `Exercise` interface'i `gifUrl`'ü kullanır.)
- **Medya**: GIF'ler hâlâ uzak CDN'de — `https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/<path>.gif`. `ExerciseMedia.tsx`: `NEXT_PUBLIC_EXERCISE_VIDEO_BASE` set ise `<slug>.mp4` (autoplay/loop/muted), değilse GIF `<img>`; video hata → GIF fallback.
- **Native notu**: exercises.json `require()`/asset ile bundle'lanacak; medya RN `Image`/`expo-video` ile gösterilecek (GIF RN'de `Image` ile çalışır; mp4 için expo-av/expo-video). Env değişkeni `EXPO_PUBLIC_...` adına dönecek.

---

## 6. Harita (Leaflet)

- `MapView.tsx` (client, `react-leaflet` değil **doğrudan `leaflet` imperative API**): CARTO `dark_all` tile layer, merkez `[51.5074,-0.1278]` (London), zoom 12. Her `Place` için renkli `divIcon` marker (gym=`#39ff14` yeşil, park=`#22d3ee` cyan — **eski neon palet, Swiss temadan kalma artık**) + popup (isim+açıklama).
- `DynamicMapView.tsx`: `next/dynamic` `ssr:false` sarmalayıcı.
- Veri `lib/places.ts` (sabit): `londonGyms` (6), `londonParks` (6), `bikeRoutes` (6). `Place { id, name, lat, lng, type:'gym'|'park', description }`.
- **Native**: `react-native-maps` (Google/Apple) veya `expo-maps`. Marker renkleri Swiss/pastel paletine hizalanacak (neon yeşil/cyan kaldırılacak). Tile sağlayıcı kararı Faz 2'de.

---

## 7. Tasarım Token'ları (globals.css)

**Sistem: Monokrom Swiss/editorial.** Dark = kök (`:root`), Light = `[data-theme="light"]`. Primary aksiyon = **mürekkep-ters** (`.btn-ink`: dark'ta beyaz buton/siyah yazı, light'ta tersi). Accent çok nadir. Pastel seriler yalnız veri/grafik kodlaması (marka değil).

### Renkler — Dark (kök)
```
--background #0a0a0b   --foreground #f4f4f5   --muted #8a8a90   --muted-bg #1c1c1f
--card-bg #141416      --card-border #26262a
--surface-1 #141416    --surface-2 #1c1c1f    --surface-3 #242428
--ink #f4f4f5          --ink-text #0a0a0b      (mürekkep-ters CTA)
--accent #c99700       (HARDAL — tek vurgu: today-dot, streak, focus ring)
--primary → alias(--accent), --primary-dark #a77e00, --primary-glow none
```
### Renkler — Light (`[data-theme="light"]`)
```
--background #fafaf8   --foreground #16161a   --muted #6e6e73   --muted-bg #f3f2ee
--card-bg #ffffff      --card-border #e6e4df
--surface-1 #ffffff    --surface-2 #f3f2ee    --surface-3 #eae8e2
--ink #16161a          --ink-text #fafaf8
```
### Pastel veri serisi (oklch — subway-dot stili)
```
Dark:  --series-red  oklch(65% 0.09 20)    --series-blue  oklch(65% 0.09 240)
       --series-green oklch(65% 0.09 145)   --series-amber oklch(70% 0.10 75)
       --series-violet oklch(65% 0.09 290)
Light: aynı hue, biraz daha doygun: red/blue/green/violet ~oklch(58% 0.11 h), amber oklch(62% 0.12 75)
```
### Radius / yüzey
```
--r-outer 1.5rem  --r-inner 1rem  --radius-pill 9999px
--r-region 0.5rem  (bölge/kart — tek Swiss dil)   --r-field 0.375rem (input)
.surface-region: surface-1 + 1.5px card-border + r-region
.ui-field: 1.5px border + surface-2 + r-field; focus → accent border + 1px accent ring
```
### Tipografi
```
--font-sans = Geist (next/font/google)     --font-mono = Geist Mono
Hero/display: çok bold (font-black), tracking-tighter, leading ~0.9 (kelime = tasarım)
Mikro-etiketler: font-mono, uppercase, tracking 0.2–0.3em, 10–11px, --muted
.tabular: tabular-nums (sayılar)
```
### Hareket / yardımcı sınıflar
```
ease-out-expo cubic-bezier(0.16,1,0.3,1)  — slide-up
panel ease-in-out [0.45,0,0.55,1]  (motionTokens.ease.inOut)
animate-fade-in-up / slide-up / fade-in, tap-scale (active:scale .96),
scrollbar-hide, safe-bottom (env safe-area), pb-safe-nav,
glass (background blur 16px), skeleton (shimmer), prefers-reduced-motion override
```
- **Native notu**: CSS değişkenleri → NativeWind v5 theme config + bir TS token modülüne taşınacak. `oklch` RN'de yok → hex/rgb karşılıklarına çevrilecek. Geist fontu `expo-font` ile yüklenecek. `env(safe-area-inset)` → `react-native-safe-area-context`.

---

## 8. Diğer Notlar / Riskler

- **Companion** geçmişi kalıcı değil (in-memory) — vizyonda kalsın deniyor; native'de istenirse MMKV'ye alınabilir (karar Faz 3+).
- **Social** tamamen mock (`data/mock-social.ts`) — şimdilik stil hizalaması yeterli (vizyon notu).
- **`/exercises`** server-component + `searchParams` → native'de client filtre + (gerekirse) route param'a dönecek.
- **Settings "clear data" eksiği**: `measurements` + `vitals` key'leri silinmiyor → native'de düzeltilecek (tüm gympal-* key'leri temizle).
- **Eski neon kalıntıları**: harita marker'ları (`#39ff14`/`#22d3ee`) ve birkaç `shadow-[...rgba(57,255,20...)]` hâlâ duruyor; `profile/edit` brutalist çerçeve kullanıyor. Native yeniden çizimde Swiss/pastel'e hizalanacak.
- **Tasarım vizyonu (memory `pas2-fullpage-parallax-vision`)**: tam-sayfa bölümler + parallax, kutusuz bold tipografi, soluk pastel, numaralı daireler, gesture pager (CSS snap DEĞİL), takvim yatay-swipe. Body: çoklu seri trend + tap-to-cycle period + basılı-tut log popup (NumberScrubber). Bu yön native'de **korunup güçlendirilecek**.
- **Test**: `*.test.ts` dosyaları var (profile/storage/tracker/workout) — Jest + RN Testing Library'ye taşınacak, saf logic testleri büyük ölçüde aynen geçer.

---

## Sıradaki Adım (onay bekliyor)
Bu Faz 0 analizi onaylanınca **Faz 1**: detaylı eşleştirme tablosu eklenecek
(Next App Router→Expo Router, div/span→View/Text, CSS→NativeWind, motion/react→Reanimated 3 + gesture-handler,
Leaflet→react-native-maps, localStorage→MMKV, lucide-react→lucide-react-native, Vitest→Jest+RNTL).

**Açık karar (Faz 1 öncesi netleşmeli):** Mobil bottom nav'da "Maps" sekmesi olacak mı? (bkz. §2 uyumsuzluk)

---

## Faz 1 — Web → Native Eşleştirme Tablosu

> Faz 0 analizi + DESIGN_SYSTEM.md + BUDDY_ARCHITECTURE.md üstüne oturur.
> Kararlar onaylıdır; bu tablo Faz 2 kurulum adımlarının girdisidir.

---

### 1. Route / Navigasyon

| Web (Next.js App Router) | Native (Expo Router) | Not |
|--------------------------|----------------------|-----|
| `app/page.tsx` → Bunker | `app/(tabs)/index.tsx` | BottomNav sekme 1 |
| `app/body/page.tsx` | `app/(tabs)/vitals.tsx` | Sekme adı değişti: Body → Vitals |
| `app/companion/page.tsx` | `app/(tabs)/buddy.tsx` | FAB kaldırıldı; artık tam sekme |
| `app/social/page.tsx` | `app/(tabs)/social.tsx` | Yatay pager: feed/events/find-a-pal |
| `app/profile/page.tsx` | `app/profile/index.tsx` | BottomNav'da değil; sağ ribbon → genişle |
| `app/profile/edit/page.tsx` | `app/profile/edit.tsx` | Onboarding 4 adım korunur |
| `app/program/page.tsx` | `app/program/index.tsx` | Bunker'dan modal/stack olarak açılır |
| `app/exercises/page.tsx` | `app/exercises/index.tsx` | Server component → client filtre |
| `app/settings/page.tsx` | `app/settings/index.tsx` | Settings stack içinde |
| `app/gyms/page.tsx` | **KALDIRILDI** | Veri Social'a taşındı (`places.ts`) |
| `app/parks/page.tsx` | **KALDIRILDI** | Veri Social'a taşındı |
| `app/routes/page.tsx` | **KALDIRILDI** | Veri Social'a taşındı |
| `app/layout.tsx` (ThemeProvider, BottomNav, Navbar) | `app/_layout.tsx` | Expo Router root layout; Navbar yok (native'de sadece BottomNav) |
| `app/template.tsx`, `app/error.tsx` | `app/+not-found.tsx`, hata boundary | Expo Router hata işleme |

**BottomNav (native — 4 sekme, FAB yok):**

| Sıra | Sekme | Route | Eski karşılık |
|------|-------|-------|---------------|
| 1 | Bunker | `(tabs)/index` | `/` |
| 2 | Vitals | `(tabs)/vitals` | `/body` |
| 3 | Buddy | `(tabs)/buddy` | `/companion` (mock → Groq) |
| 4 | Social | `(tabs)/social` | `/social` |

Profile: her ekranda **sağ üst ikon** → `app/profile/` stack.

---

### 2. UI Primitive'leri

| Web | Native | Not |
|-----|--------|-----|
| `<div>` (layout) | `<View>` | Temel kapsayıcı |
| `<span>`, `<p>` | `<Text>` | Tüm metin `<Text>` içinde olmalı |
| `<button>` | `<Pressable>` | `activeOpacity` / `android_ripple` ile; `tap-scale` (active:scale .96) → `Animated.scale` |
| `<img>` (egzersiz GIF) | `<Image>` (`expo-image`) | GIF RN Image ile çalışır; `expo-image` cache + placeholder desteği ekler |
| `<video>` (`mp4` fallback) | `<Video>` (`expo-av` veya `expo-video`) | `NEXT_PUBLIC_EXERCISE_VIDEO_BASE` → `EXPO_PUBLIC_EXERCISE_VIDEO_BASE` |
| `<input>`, `<textarea>` | `<TextInput>` | NativeWind ile stillenebilir |
| `<select>` | `<Picker>` veya custom `<Pressable>` listesi | Basit seçimler için custom tercih edilir |
| `<a>` (internal) | `<Link>` (expo-router) | |
| `<ScrollView>` (web) | `<ScrollView>` | API benzer; `horizontal` prop ile yatay |
| `<FlatList>` / `<SectionList>` | `<FlatList>` / `<SectionList>` | Egzersiz grid, social feed için |
| `vaul` bottom sheet | `@gorhom/bottom-sheet` | Gesture-native sheet; API farklı |
| `canvas-confetti` | `react-native-confetti-cannon` veya `lottie-react-native` | Kutlama efekti |
| `recharts` trend grafik | `victory-native` veya `react-native-skia` tabanlı | Skia: Reanimated ile entegre, GPU render |

---

### 3. Stil — Tailwind/CSS → NativeWind v5

| Web | Native | Not |
|-----|--------|-----|
| `tailwind.config` + `globals.css` CSS custom properties | `tailwind.config.ts` + `theme.extend` + TS token modülü | NativeWind v5 CSS Variables desteği var; `--bg`/`--fg` token'ları config'e alınır |
| `--bg`, `--fg` ve türevleri (globals.css) | `tailwind.config.ts → theme.colors` + `src/lib/tokens.ts` | oklch → hex/rgb dönüşümü (RN oklch desteklemez) |
| `data-theme="dark"/"light"` attribute | ThemeContext (custom) + `useColorScheme` | `next-themes` yok (bkz. §8); token'lar runtime swap |
| `className="..."` (web) | `className="..."` (NativeWind v5) | Syntax aynı; NativeWind compile-time dönüştürür |
| `safe-bottom`, `pb-safe-nav` (env safe-area) | `react-native-safe-area-context` `SafeAreaView` / `useSafeAreaInsets` | |
| `scrollbar-hide` | ScrollView `showsVerticalScrollIndicator={false}` | |
| `glass` (backdrop-blur) | RN'de `BlurView` (`expo-blur`) | Sınırlı platform desteği; sparingly |
| `skeleton` shimmer | `react-native-skeleton-placeholder` veya Reanimated shimmer | |
| Geist Sans / Geist Mono (`next/font`) | `expo-font` ile yükle | `useFonts` hook; splash screen fontlara kadar bekler |
| `animate-fade-in-up`, `slide-up` CSS | Reanimated 3 `withTiming` / `withSpring` | CSS animation → RN animated value |

**NativeWind v5 token entegrasyon özeti:**
```ts
// tailwind.config.ts (özet)
theme: {
  extend: {
    colors: {
      bg: 'var(--bg)',       // runtime CSS variable (NativeWind v5 destekler)
      fg: 'var(--fg)',
      surface1: 'var(--surface-1)',
      surface2: 'var(--surface-2)',
      border: 'var(--border)',
      muted: 'var(--muted)',
      ink: 'var(--ink)',
      'ink-text': 'var(--ink-text)',
      // veri serileri
      'series-red': '#c97171',
      'series-blue': '#7195c9',
      // ...
    }
  }
}
```

---

### 4. Animasyon / Hareket

| Web (`motion/react`) | Native | Not |
|----------------------|--------|-----|
| `motion.div` (`PanelPager` dikey gesture pager) | `Gesture.Pan` (RNGH) + `useAnimatedStyle` (Reanimated 3) | Swipe eşikleri: SWIPE_OFFSET=70, SWIPE_VELOCITY=400 — birebir korunur |
| `useMotionValue`, `useTransform` | `useSharedValue`, `useDerivedValue` | |
| `drag`, `dragConstraints` | `Gesture.Pan` + `clamp` | |
| `variants` + `stagger` (panelChildVariants, 0.07s stagger) | `withDelay` + `withTiming` döngüsü veya `react-native-reanimated-carousel` | Stagger 0.07, delayChildren 0.12 korunur |
| `layoutId="bottomnav-indicator"` kayar gösterge | Reanimated `useAnimatedStyle` + `SharedValue` pozisyon | |
| `prefers-reduced-motion` → drag kapalı, sadece fade | `useReducedMotionConfig` (Reanimated 3.x) | Reanimated reduced motion API'si var |
| `ease-in-out [0.45,0,0.55,1]` panel geçişi | `Easing.bezier(0.45, 0, 0.55, 1)` | |
| `ease-out-expo cubic-bezier(0.16,1,0.3,1)` | `Easing.bezier(0.16, 1, 0.3, 1)` | |
| `active:scale-.96` tap-scale | `useAnimatedStyle` + `withTiming` scale | Pressable `onPressIn/Out` |
| Takvim yatay swipe (`weekOffset` ±1) | `Gesture.Pan` yatay + `FlatList` pagingEnabled | |
| Social yatay 3 panel pager | `react-native-pager-view` veya `FlatList` horizontal pagingEnabled | |

---

### 5. Harita

| Web (Leaflet) | Native | Not |
|---------------|--------|-----|
| `leaflet` + imperative API, `DynamicMapView` (`ssr:false`) | `react-native-maps` (Google Maps / Apple Maps) | Expo SDK 56 ile `expo-maps` (yeni, beta) alternatif — Faz 2'de karar |
| CARTO dark tile | Google Maps / Apple Maps varsayılan + minimal tema | Dark tile custom style (JSON) ile mümkün |
| `divIcon` renkli marker (`#39ff14` neon, `#22d3ee` cyan) | `<Marker>` + custom `<View>` marker | Neon renkler kaldırılır; tema/pastel uyumlu |
| `/gyms`, `/parks` ayrı route'lar | **Kalktı** — Social sekmesi içinde sade harita | `places.ts` verisi Social'a taşınır |
| `londonGyms`, `londonParks`, `bikeRoutes` (`lib/places.ts`) | `src/data/places.ts` (aynı yapı) | Veri ve tip birebir korunur; sadece import yolu değişir |
| `next/dynamic ssr:false` sarmalayıcı | `Platform.OS` kontrolü veya doğrudan import | RN'de SSR yok |

---

### 6. Kalıcı Depolama — localStorage → MMKV

> **Altın kural: key isimleri, veri yapısı ve fonksiyon imzaları BİREBİR korunur.**
> Yalnız `lib/storage.ts` iç gövdesi değişir; tüketici kod dokunulmaz.

| Web (`localStorage`) | Native (`react-native-mmkv`) | Not |
|----------------------|------------------------------|-----|
| `localStorage.getItem(key)` | `storage.getString(key)` + `JSON.parse` | |
| `localStorage.setItem(key, JSON.stringify(v))` | `storage.set(key, JSON.stringify(v))` | |
| `localStorage.removeItem(key)` | `storage.delete(key)` | |
| `createStore<T>(key)` generic soyutlaması (`lib/storage.ts`) | Aynı imza, MMKV gövde | Tek değişen yer burası; tüketici bileşenler değişmez |
| `lib/profile.ts` (doğrudan localStorage) | Aynı imza, MMKV gövde | |
| `lib/program-store.ts` (doğrudan localStorage) | Aynı imza, MMKV gövde | |
| `crypto.randomUUID()` (`id` üretimi) | `expo-crypto` `randomUUID()` | RN'de `crypto.randomUUID` yok; polyfill veya expo-crypto |
| `next-themes` key `"theme"` | `MMKV` key `"theme"` (veya `"gympal-theme"`) | ThemeContext custom, value schema aynı |

**10 gympal-* key — tamamı MMKV'ye birebir:**

| Key | Tür |
|-----|-----|
| `gympal-profile` | `UserProfile` |
| `gympal-program-custom` | `WorkoutProgram` |
| `gympal-weight-log` | `WeightEntry[]` |
| `gympal-mood` | `MoodEntry[]` |
| `gympal-checklist` | `ChecklistItem[]` |
| `gympal-todos` | `TodoItem[]` |
| `gympal-shopping` | `ShoppingItem[]` |
| `gympal-meals` | `MealEntry[]` |
| `gympal-measurements` | `BodyMeasurement[]` |
| `gympal-vitals` | `HealthVital[]` |

**Settings "clear all data" düzeltmesi (Faz 0'da tespit edilen bug):**
Web'de `measurements` + `vitals` silinmiyordu. Native'de tüm `gympal-*` key'leri + `"theme"` silinir.

---

### 7. İkonlar

| Web | Native | Not |
|-----|--------|-----|
| `lucide-react` | `lucide-react-native` | API aynı; import yolu değişir |
| `<Icon size={20} />` | `<Icon size={20} color={...} />` | Native'de `color` prop zorunlu (CSS inherit yok) |
| CSS `currentColor` otomatik renk | Explicit `color` token (`fg`, `muted` vb.) | |

---

### 8. Tema Sistemi

| Web | Native | Not |
|-----|--------|-----|
| `next-themes` (`ThemeProvider`, `useTheme`) | Custom `ThemeContext` + `useColorScheme` | `next-themes` Expo'da çalışmaz |
| `data-theme` HTML attribute | React Context value → NativeWind CSS variables | NativeWind v5 runtime CSS var desteği |
| `defaultTheme="dark"`, `enableSystem={false}` | MMKV'den yükle, default `{ bg: '#0a0a0b', fg: '#f4f4f5' }` | |
| İki sabit tema (dark/light) | Kullanıcı `--bg` + `--fg` özgürce seçer | DESIGN_SYSTEM.md §2: zemin + metin seçimi |
| `globals.css` CSS variable dönüşümü | `tokens.ts` hex/rgb sabitleri + NativeWind theme | oklch → hex/rgb (RN oklch desteklemez) |

---

### 9. Test

| Web | Native | Not |
|-----|--------|-----|
| Vitest | Jest (Expo preset) | `jest-expo` preset |
| `@testing-library/react` | `@testing-library/react-native` | API büyük ölçüde aynı |
| `jsdom` ortamı | RN test ortamı | |
| `*.test.ts` (profile, storage, tracker, workout) | Aynı dosyalar, import yolları güncellenir | Saf logic testleri büyük ölçüde aynen geçer |
| `vitest.config.ts` | `jest.config.js` (`jest-expo`) | |

---

### 10. Companion Mock → Buddy (Groq + Tool Calling)

| Web (`/companion`) | Native (`(tabs)/buddy`) | Not |
|--------------------|-------------------------|-----|
| `lib/companion.ts` `getMockResponse()` anahtar-kelime eşleşmesi | `lib/buddy/groq-provider.ts` `resolveIntent()` | Groq API tool calling |
| In-memory geçmiş (`messageHistory`, MAX 20, yenilenmez) | Opsiyonel MMKV geçmiş (karar Faz 3) | Şimdilik in-memory kalabilir |
| Mock 500ms gecikme | Gerçek Groq API çağrısı | Loading state zorunlu |
| Tool yok (sadece metin) | 13 tool: `logWater`, `logWeight`, `logMood` ... (bkz. BUDDY_ARCHITECTURE.md §3) | |
| Sabit cevaplar | Model agnostik `BuddyProvider` interface → Groq implementasyonu | |
| API key yok | Groq API key → MMKV `"gympal-buddy-key"` | Settings AI Companion bölümünde |

**Faz 3 Opus notu:** Buddy tool intent eşleştirme prompt'u ilk kez tasarlanırken bir turluk Opus girdisi alınacak. O noktaya gelindiğinde hatırlatılacak.

---

### 11. Bağımlılık Eşleştirme (package.json delta)

| Kaldırılacak (web) | Eklenecek (native) |
|--------------------|--------------------|
| `next`, `next-themes` | `expo`, `expo-router` |
| `react-dom` | `react-native` |
| `tailwindcss` (PostCSS) | `nativewind`, `tailwindcss` (NativeWind preset) |
| `motion` (`motion/react`) | `react-native-reanimated`, `react-native-gesture-handler` |
| `leaflet`, `react-leaflet` | `react-native-maps` (veya `expo-maps`) |
| `recharts` | `victory-native` veya Skia tabanlı alternatif |
| `vaul` (bottom sheet) | `@gorhom/bottom-sheet` |
| `canvas-confetti` | `react-native-confetti-cannon` veya `lottie-react-native` |
| `lucide-react` | `lucide-react-native` |
| `vitest`, `@testing-library/react` | `jest-expo`, `@testing-library/react-native` |
| — | `react-native-mmkv` |
| — | `expo-font` |
| — | `expo-image` |
| — | `expo-av` / `expo-video` |
| — | `expo-blur` |
| — | `expo-crypto` |
| — | `react-native-safe-area-context` |
| — | `react-native-screens` |
| — | `react-native-pager-view` |
| — | `@groq-sdk/groq` (veya `fetch` ile direct) |

---

> **Faz 1 tamamlandı.** Onay sonrası Faz 2: kurulum + klasör iskeleti.
