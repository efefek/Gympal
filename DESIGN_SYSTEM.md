# GymPal — Design System (Native)

> Tasarım ve mimari kararları. Faz 1 (eşleştirme tablosu) bu belgenin üstüne oturacak.
> Hedef: `C:\Users\kosee\Projects\gympal` (Expo SDK 56, expo-router, NativeWind).
> Tarih: 2026-06-14. Bu belge onaylanmadan Faz 1'e geçilmeyecek.
> Kaynak vizyon: memory `pas2-fullpage-parallax-vision` + bu oturumdaki kullanıcı kararları.

---

## 1. Navigasyon

### Bottom Nav — 4 sekme, FAB YOK
Sıra: **Bunker · Vitals · Buddy · Social**

| Sekme | Eski karşılık | İçerik |
|-------|---------------|--------|
| **Bunker** (`/`) | eski `/` Bunker | Kendi spor programım: gesture pager (Dashboard + Program), bu hafta takvimi, today's plan |
| **Vitals** | eski `/body` | Vücut sağlığı: Body Count (BMI), çoklu seri trend, vital log'ları |
| **Buddy** | eski `/companion` | AI companion (artık gerçek Groq + tool calling — bkz. `BUDDY_ARCHITECTURE.md`) |
| **Social** | eski `/social` | Yatay 3 panel pager: feed / events / find a pal (harita burada yaşıyor) |

Kararlar:
- **FAB kaldırıldı.** Buddy artık tam sekme, ortada taşan yuvarlak buton yok.
- **Maps sekmesi kaldırıldı.** Harita ayrı route değil; Social içinde sade biçimde yaşıyor (event/discover bağlamında). Eski `/gyms`, `/parks`, `/routes` ayrı route'ları kaldırılıyor; verileri Social'a taşınıyor, harita minimal.
- **Profile bottom nav'da DEĞİL.** Sağ üst köşede ikon olarak duruyor (her ekranda erişilebilir, bkz. sağ ribbon §2).

### İki Çapa Ribbon (her ekranda sabit)
Her ekranın üstünde iki köşede iki sabit "çapa" var. Kapalıyken iki köşede iki **siyah blok** olarak görünür — tasarımın parçası gibi durur, göz önünde değil ama hep orada. Basınca ribbon estetik biçimde açılır (aşağı doğru genişler/iner).

**Rolleri kesin ayrı, karışmazlar:**

**Sol ribbon — Durum ve Zaman çapası**
- Bugünün özeti
- Next event (Social events'ten)
- Bugünkü plan (Bunker today's plan)
- Su ve intake durumu (Vitals vital'lerinden)
- Streak
- Buddy'den tek satır hatırlatma

**Sağ ribbon — Kimlik ve Ayar çapası**
- Profil özeti (avatar/isim/seviye)
- Level
- Streak (kimlik bağlamında, "benim ilerlemem")
- "Genişlet" → tüm ekranı kaplayan **full profile** ve **achievement'lar**
- Buradan ayarlara (Settings) ve Social Profile alanına giriş

> İlke: sol = "şu an ne oluyor, ne yapmalıyım, zaman" / sağ = "ben kimim, ilerleme, ayar". Veri tipleri çapraz sızmaz.

---

## 2. Tema — Tek Renk Sistemi

### Çekirdek model
Tek renk sistemi. Temel **siyah ve beyaz**. Kullanıcı **zemin (BG) ve metin rengini özgürce seçer**:
- Siyah zemin + beyaz metin (yüksek kontrast, dark)
- Beyaz zemin + siyah metin (yüksek kontrast, light)
- Turkuaz pastel zemin + siyah metin (düşük uyarım)
- vb. (kullanıcının seçtiği herhangi bir zemin + okunur metin kombinasyonu)

Kurallar:
- **Tüm uygulama BG'si aynı tek renk.** Bölümlere göre değişmez. Bunker, Vitals, Buddy, Social hepsi aynı tema zemini.
- **Renk sabit değil, tema değişkeni.** İki çekirdek token: `--bg` (zemin) ve `--fg` (metin). Diğer tüm yüzey/kenar/muted değerleri bu ikisinden türetilir (opacity/mix ile).
- Kullanıcıya **"kendi konforunu seç"** olarak sunulur: düşük uyarım isteyen pastel zemin seçer, yüksek kontrast isteyen siyah/beyaz seçer.

### Türetilen token'lar (bg/fg üstünden hesaplanır)
```
--bg            kullanıcı seçimi (zemin)
--fg            kullanıcı seçimi (metin)
--surface-1     mix(fg into bg, ~%5)      kart/bölge zemini
--surface-2     mix(fg into bg, ~%9)      ikincil yüzey
--surface-3     mix(fg into bg, ~%14)     üçüncül yüzey
--border        mix(fg into bg, ~%15)     kenarlık
--muted         mix(fg into bg, ~%45)     ikincil metin
--ink           = fg                       mürekkep-ters CTA zemini
--ink-text      = bg                       mürekkep-ters CTA metni
```
Mürekkep-ters CTA (`.btn-ink` muadili) korunur: ana aksiyon butonu zemin/metni temaya göre ters döner. Pastel temada da çalışır.

### Accent
Eski hardal `#c99700` accent **opsiyonel/çok nadir** kalır (today-dot, streak vurgusu, focus). Tema renk sistemiyle çakışmaması için temaya bağlı yeniden değerlendirilecek; default olarak minimumda tutulur.

### Pastel veri serileri (yalnız grafik/gruplama)
Vitals trend grafiklerinde çoklu seri kod renkleri (subway-dot stili) korunur:
`series-red / series-blue / series-green / series-amber / series-violet`. Bunlar **marka rengi değil**, sadece veri ayrımı. oklch → hex/rgb karşılığına çevrilecek (RN oklch desteklemez).

---

## 3. Social Rengi (tek istisna)

Renk istisnası **sadece Social**, orada da **sadece kart seviyesinde**.
- Social zemini yine **ana tema rengiyle aynı**.
- **Event kartları** kendi belirgin rengini taşır: **turuncu veya sarı zemin + siyah bold tipografi**.
- Referans dili: bold sans typo, **numaralı ok işaretleri**, belirgin ayrışan kartlar.
- Kartlar dışında Social hiçbir yerde tema renginden sapmaz.

---

## 4. Component Davranışı (kontrast zemin)

Hazır galeri/komponent kütüphanesinden eklenen bileşenler tema rengine göre **kontrast zemine** dönüşür:
- Kullanıcı turkuaz pastel seçtiyse, eklenen component **koyu zıt zemine** geçer (okunurluk + ayrışma).
- Yani componentler sabit renk taşımaz; `--bg`/`--fg` ve türevlerinden kontrast hesabıyla kendi yüzeyini seçer.
- Hedef: galeri'den gelen bir kart/sheet/grafik, hangi tema seçilirse seçilsin "yamalı" durmaz, sisteme oturur.

---

## 5. Neon Temizliği

Eskiden kalan her şey tek renk tema sistemine hizalanacak, tamamen silinecek:
- Harita marker renkleri (`#39ff14` neon yeşil, `#22d3ee` cyan) → kaldırılır, marker'lar tema/mono.
- Brutalist çerçeveler (`profile/edit`'teki `border-[3px]` foreground çerçeve) → kaldırılır, tek Swiss yüzey diline geçer.
- `shadow-[...rgba(57,255,20,...)]` neon glow'lar → kaldırılır.
- İlke: **aşırı grafik yok, minimal logolar, text ağırlıklı, haritalar sade.**

---

## 6. Tipografi

- **Bold display başlıklar + net body.**
- İki referansın birleşimi:
  - **Music OS** → Swiss editorial bold dili (dev display tipo, kelime = tasarım, numaralı daireler, monospace mikro-etiketler, oklar).
  - **Mood diary** → yuvarlak kart ve bold başlık dili.
- Sonuç: Swiss editorial bold yapı + yuvarlak yumuşak kartlar. Hero font-black + tracking-tighter; body net ve okunur; mikro-etiketler mono uppercase.
- Font: Geist Sans + Geist Mono (expo-font ile yüklenecek).

---

## 7. Social Mimarisi

**Yatay pager, üç panel** (gesture, bottom nav Social sekmesi altında):

### Panel 1 — Feed
Gerçek bir social feed. Twitter benzeri ama **daha iyi ve derli toplu** — eski twitter clone fikrinden daha gelişmiş. Post kartları, etkileşim, temiz hiyerarşi.

### Panel 2 — Events
Spor etkinlik kartları: 5K koşu, London Marathon vb. **Renkli kartlar** (turuncu/sarı zemin, siyah bold typo — §3). Numaralı, ayrışan, takvimli.

### Panel 3 — Find a Pal
Basit **aktivite bazlı eşleşme**. **Cinsiyetsiz, sadece aktivite**:
- Bisiklet arkadaşı
- Indoor gym
- Outdoor gym
- Basket / futbol
**3 ila 5 basit algoritma**, karmaşık değil (örn. aktivite eşleşmesi + konum yakınlığı + zaman uygunluğu gibi düz kurallar).

### Social Profile (Profile altında yaşıyor)
- Social profil bilgisi ana **Profile ayarları** altında durur (sağ ribbon → genişlet → Profile).
- Social'dan **"edit your profile"** → Profile altındaki **Social Profile** alanına yönlendirir.
- Orada kullanıcı **hangi bilgiyi publish edeceğini seçer**: data control ve share ayarları burada.
- Harita da Social içinde sade biçimde (events/discover bağlamında); ayrı route değil.

---

## 8. ADHD Friendly İlkeler

> Her ekran çizimi bu ilkelere uyacak. Bu, ürünün omurgası.

1. **Tek ekran tek iş.** Her ekranda **bir baskın aksiyon**, gerisi sessiz. İkincil her şey geri çekilir.
2. **Progressive disclosure.** Özet görünür, detay bir dokunuş ötede. **Ribbon mantığı her yere uygulanır** (kapalı = özet/sessiz, açık = detay).
3. **Friction sıfır.** Buddy ile çok adımlı manuel giriş **tek cümleye iner**. Bu, app'in **en ADHD friendly özelliği** ve öne çıkarılır (bkz. `BUDDY_ARCHITECTURE.md` tool calling).
4. **Amaçlı hareket.** Animasyon **sadece geçiş ve geri bildirimde**. Boşta duran dekoratif/ambient animasyon **yok**. `prefers-reduced-motion` / reduced motion ayarına **saygı**.
5. **Net durum geri bildirimi.** Bir şey yapılınca **anında görünür onay**. Belirsizlik bırakma (örn. Buddy mutasyonundan sonra "şunları yaptım" özeti).
6. **Zaman körlüğüne karşı.** Workout ve rest timer **büyük ve net** görünür geri sayım. Streak ve "this week" sol ribbon'da zaman çapası olarak.
7. **Renk konforu.** Tema rengi seçimi (§2) **düşük uyarım ihtiyacına** doğrudan cevap.

---

## 9. Settings

- **Clear data bug'ı düzeltilecek:** `measurements` ve `vitals` key'leri de silinecek (eski kodda unutulmuştu). Tüm `gympal-*` key'leri + tema key'i temizlenecek.
- **Google Health bağlantısı:** şimdilik **dummy placeholder** (görünür ama işlevsiz, ileri faz).
- **AI Companion bölümü:** Groq API key girişi + model seçimi (detay `BUDDY_ARCHITECTURE.md` §Settings UX).
- Tema seçimi Settings altında (zemin + metin rengi = "kendi konforunu seç").
- Korunan eylemler: All exercises, Edit profile, Reset program, Clear all data, versiyon bilgisi.

---

## 10. Açık Kalan / Faz 1'e Devreden Notlar

- Eski `/gyms` `/parks` `/routes` route'ları kalkıyor; `places.ts` verisi Social'a taşınacak (gym/park/route → events/discover + sade harita).
- `exercises.json` (1323 kayıt) ve GIF CDN akışı korunur; yalnız medya gösterimi RN'e uyarlanır.
- Tüm localStorage key'leri ve veri yapısı MMKV'ye **birebir** taşınır (key ve şekil değişmez).
- Zero backend korunur; tek dış bağlantı Buddy → Groq (bkz. `BUDDY_ARCHITECTURE.md`).

---

## 11. Görsel Dil — Referans Sentezi (Faz 4)

> Kullanıcının 17 referans + yorumundan çıkarılan bağlayıcı görsel dil. Her ekran buna uyacak.
> Renkler referanslardan ALINMAZ (bizim tek-renk tema), sadece **dizilim, tipografi, kart kurgusu, grafik dili** alınır.

### 11.1 Tipografi (en kritik)
- **Bauhaus / brutalist bold display.** Dev, `font-display` (Geist Black), sol-hizalı, satır satır kırılan başlıklar (ref: "Mood / diary", "Statistics", "Track. Understand. Thrive.").
- Başlık = tasarımın kendisi. Hero başlık ekranın üst üçte birini kaplar, çok büyük (48–72px), tracking-tighter.
- Body net ve okunur; mikro-etiketler `font-mono` uppercase, geniş tracking.
- Sadelik var ama "o kadar da sade değil" — başlık + birkaç bold öğe + dolu ama nefes alan layout.

### 11.2 Renk
- **GRADIENT YOK.** Hiçbir yerde gradient kullanılmaz (kullanıcı kesin).
- Tek tema (`--bg`/`--fg`) her ekranda aynı zemin.
- **Accent (turuncu/sarı) yalnız vurgu**: aktif sekme, aktif chip, today-dot, primary CTA, streak. "Tek-az-renk" buralarda görünür.
- Kart renk-alternatifi: çoğu kart `surface`; **bir öne çıkan kart accent zeminli** (siyah bold typo üstünde) — ref Image 11/12/14 lime kartlar, Image 1 vurgu chip'leri.
- Pastel düşük-satürasyon = yalnız veri/grafik kodlaması (takvim noktaları, trend serileri).

### 11.3 Kartlar & Yüzeyler
- Yuvarlak köşe (rounded-2xl/3xl), net `1.5px` border, dolgulu iç boşluk.
- **Border'lı "cep" geçiş**: ana ekrandan alt ekrana inerken border'lı bir kart/sheet yukarıdan iner (ref Image 2). Customize/detay bu cepte açılır.
- Full-page dolma: boş alan minimum, içerik bölümleri ritimli (ref Image 8/9).

### 11.4 Hareket
- **Parallax şart**: panel geçişinde ve scroll'da başlık / takvim / kartlar **ayrı hızda** hareket eder (tek blok slide DEĞİL). PanelPager `progress` paylaşır; katmanlar farklı katsayıyla bağlanır.
- Text reveal (cult-ui ilhamı): hero başlık karakter/kelime bazlı staggered fade+slide-up reveal (Reanimated).
- Beğenilen swipe akıcılığı korunur (ease-in-out, 70px/400vel eşik).
- ADHD: amaçlı hareket, boşta dekoratif animasyon yok, reduced-motion saygısı.

### 11.5 Ribbon'lar (netleşti)
- **Sol üst = durum çapası** (kapalı blok). ADHD-friendly: bugünkü plan, streak, su/intake, sosyal bildirim. Eski Settings + "01/02" sayaç KALDIRILDI.
- **Sağ üst = profil**, 3 aşama: kapalı blok → tap: küçük pop-up (brief info özeti) → tap: tam ekran profil + achievement. Settings buradan (profil içinden) erişilir.

### 11.6 Alt Bar
- İkon + metin (Bunker/Vitals/Buddy/Social). **Gradient yok.** Bold, net, materyal.
- Aktif sekme **accent renkte** (tema accent'i: turuncu/sarı).

### 11.7 Ekran-özel referans notları
- **Vitals**: cetvel/ruler intake göstergesi (su/protein/kalori — ref Image 10), bold sayılar, bar + ring grafik (Image 3/4/7), tap-to-cycle period.
- **Workout başlat**: total time + kalori + çalışacak kas grubu özeti + egzersiz listesi (ref Image 11). Üstte büyük görsel.
- **Aktif workout**: büyük kas-anatomi GIF (MuscleWiki, sonra HQ ile değişecek), altta geri + swipe-next + timing (ref Image 12).
- **Template'ler**: ~20 hazır program template (dolu görünsün + test edilebilir), interval kartları (ref Image 14).
- **Onboarding/profil**: betterFit tarzı adım adım, ruler slider (boy/kilo), BMI bar, basit karakter, "Next" (ref Image 15). measurement öğeleri korunur.
- **Buddy**: "How can I help today, {name}?" + öneri chip'leri/kartları (ref Image 13/17), tek-cümle → tool calls vurgusu.
- **Harita (Social)**: sade dark map + minimal pin + mesafe/süre/kalori kartı (ref Image 5), neon yok.
