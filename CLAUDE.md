@AGENTS.md

# GymPal — Proje Dokumantasyonu

## Proje Ozeti

GymPal, Londra ve cevresi icin tasarlanmis bir fitness companion web uygulamasidir. Kullanici profili olusturarak kisisellestirilmis antrenman programi alabilir, yakindaki spor salonlarini ve parklari harita uzerinde kesfedebildigini, egzersiz kutuphanesine erisebilir.

## Tech Stack

- Next.js 16 App Router (16.2.9)
- React 19
- TypeScript 5 (strict mod)
- Tailwind CSS v4
- Leaflet + react-leaflet (harita)
- lucide-react (ikonlar)
- MuscleWiki API (egzersiz veritabani — CDN uzerinden JSON)

## Komutlar

```bash
npm run dev       # Gelistirme sunucusu
npm run build     # Uretim build
npm run lint      # ESLint (flat config)
npm run test      # Vitest birim testleri (tek seferlik)
npm run test:watch # Vitest izleme modu
npm run coverage  # Test kapsam raporu (v8)
```

## Dizin Haritasi

```
src/
  app/
    page.tsx              # Ana sayfa (harita + giris noktasi)
    layout.tsx            # Kok layout
    exercises/            # Egzersiz kutuphanesi sayfasi
    gyms/                 # Spor salonu listesi sayfasi
    parks/                # Park listesi sayfasi
    profile/              # Profil olusturma/duzenleme
    program/              # Olusturulan program gorunumu
    routes/               # Rota planlama
    api/                  # API route'lari
  components/             # Paylasilan UI bilesenleri
  lib/
    profile.ts            # Kullanici profili: tipler, localStorage, yardimci fonksiyonlar
    workout.ts            # Program uretici (generateProgram)
    musclewiki.ts         # MuscleWiki API istemcisi
    places.ts             # Leaflet yer arama yardimcilari
```

## Kod Konvansiyonlari

- Immutable guncelleme: nesne mutasyonu yok, spread ile yeni nesne olustur
- Props icin named interface/type kullan, `any` yasaktir
- Fonksiyon: < 50 satir; dosya: < 800 satir
- Derin ic ice yapidan kacin (> 4 seviye); erken donus tercih et
- Tum hatalari acikca yakala, sessizce yutma
- Sabit degerler icin magic number yerine named constant kullan

## Git / Commit Konvansiyonu

Tum commit'ler **Conventional Commits** formatinda olmalidir. Her mantikli adim ayri,
aciklayici bir commit olsun — GitHub gecmisi duzenli ve profesyonel gorunsun
(is basvurusu icin onemli). Her `git push` oncesi commit'ler bu formatta hazirlanir.

### Format

```
<tip>: <kisa aciklama>

<opsiyonel govde — ne ve neden>
```

- `<tip>` kucuk harf, aciklama emir kipinde ve kisa (~50 karakter)
- Govde gerektiginde "ne" + "neden" anlatir (nasil degil)

### Tipler

| Tip | Ne zaman kullanilir |
|-----|---------------------|
| `feat` | Yeni ozellik (yeni sayfa, bilesen, kullanici-gorur islev) |
| `fix` | Hata duzeltme (bug, kirik davranis, regresyon) |
| `refactor` | Davranis degismeden kod yeniden duzenleme (isim, bolme, sadelestirme) |
| `style` | Bicimsel degisiklik (format, bosluk, CSS — mantik degismez) |
| `docs` | Dokumantasyon (README, yorum, docs/) |
| `test` | Test ekleme/duzenleme |
| `chore` | Bakim isleri (bagimlilik, config, build araclari) |
| `perf` | Performans iyilestirmesi |
| `ci` | CI/CD yapilandirmasi |

### Ornekler

```
feat: add interactive stats sheet to home dashboard
fix: prevent hydration mismatch in theme toggle
refactor: extract motion tokens into lib/motion.ts
docs: add architecture section to README
test: cover measurement logging in tracker
chore: add motion and vaul dependencies
```

### Kurallar

- Bir commit = bir mantikli degisiklik (her seyi tek dev commit'e tikmadan)
- Atribusyon `~/.claude/settings.json` ile global kapali — commit'e ekleme
- Push oncesi: `npm run lint` + `npm run test` + `npm run build` yesil olmali

## Erisebilirlik Standardi

- Her interaktif eleman klavye + ekran okuyucu ile erisebilir olmalidir
- Ikon butonlarina `aria-label` ekle
- Form elemanlarinda `htmlFor` / `id` eslesmesi zorunludur
- `eslint-plugin-jsx-a11y` CI'da aktiftir; `recommended` kurallari uygulanir
- Renk kontrasini WCAG AA ile uyumlu tut

## Test Standardi

- Cerceve: Vitest + @testing-library/react, jsdom ortami
- `src/lib/` altindaki saf (pure) fonksiyonlar oncelikli test hedefidir
- Yapi: AAA (Arrange-Act-Assert) deseni
- Test isimleri davranisi aciklar: "returns ... when ..."
- localStorage gerektiren testlerde `beforeEach(() => localStorage.clear())` kullan
- Hedef kapsam: >= 80%

---

# Waypoint — Yasayan Dokumantasyon

Bu projede **Waypoint sistemi aktiftir.**

## Her Session Basinda
1. `docs/MILESTONES.md` oku
2. `docs/WORKLOG.md` son girisini oku
3. Kullaniciya tek paragrafla ozetle: hangi milestone, son ne bitti, bu session ne yapilacak

## Her Task Bitiminde
- `docs/MILESTONES.md` icinde tamamlanan gorevleri `[ ]` -> `[x]` yap
- Ust ozet tablosunu guncelle

## Her Session Sonunda
- `docs/WORKLOG.md` sonuna tarihli giris ekle
- `docs/MILESTONES.md` ust tablosunu guncelle
