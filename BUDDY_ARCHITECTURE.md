# GymPal — Buddy Architecture (AI Companion)

> Buddy = AI companion (eski `/companion`). Faz 1 eşleştirme tablosu bu belgenin üstüne oturacak.
> Hedef: `C:\Users\kosee\Projects\gympal` (Expo SDK 56). Zero backend korunur.
> Tarih: 2026-06-14. Bu belge onaylanmadan Faz 1'e geçilmeyecek.
> İlişkili: `DESIGN_SYSTEM.md` (§8 ADHD friendly — Buddy "friction sıfır" özelliğinin kalbi).

---

## 1. Felsefe

Buddy **reasoning yapmıyor, intent eşleştirme yapıyor.** Kullanıcı doğal dille yazar; model hangi tool'u hangi parametreyle çağıracağına karar verir; **mutasyonu app uygular**, model değil. App uygular ve kullanıcıya **görünür onay** gösterir.

Bu, ürünün en ADHD friendly özelliği: çok adımlı manuel giriş tek cümleye iner.

---

## 2. Model Agnostik Tasarım

Şimdilik tek beyin: **Groq API**, çalışır halde kurulacak. Ama mimari **model agnostik**: bugün Groq, yarın başka beyin eklenince app baştan yazılmaz.

### Provider Interface
Tüm beyinler tek bir arayüzün arkasında durur:

```ts
interface BuddyProvider {
  id: string                      // 'groq' | 'custom' | 'on-device' ...
  label: string
  isAvailable(): boolean          // key var mı, model seçili mi
  listModels(): Promise<string[]> // ya da statik liste
  // Doğal dil + tool şemaları → tool çağrı kararları
  resolveIntent(input: BuddyRequest): Promise<BuddyToolCall[]>
}

interface BuddyRequest {
  userText: string
  tools: ToolSchema[]             // app'in sunduğu tool tanımları
  context?: BuddyContext          // opsiyonel: bugünkü plan, profil özeti vs.
}

interface BuddyToolCall {
  tool: string                    // örn. 'logWater'
  args: Record<string, unknown>   // örn. { ml: 1000 }
}
```

### Provider slotları
| Provider | Durum | Açıklama |
|----------|-------|----------|
| **Groq** (cloud) | **Aktif (default)** | App doğrudan Groq API'ye konuşur |
| **Custom API key** | Aktif (opsiyonel) | Kullanıcı kendi key'ini girer (yine cloud, OpenAI uyumlu uçlar) |
| **On device** | **Boş slot (ileride)** | Interface'te yeri açık, bugün doldurulmuyor; UI'da görünür ama pasif |

İlke: bugün Groq ile çalışır, yarın provider eklenince **sadece yeni bir `BuddyProvider` implementasyonu** yazılır; tool katmanı, UI ve mutasyon mantığı değişmez.

---

## 3. Tool Calling Katmanı

### Kural
Tool'lar **deterministik düz TypeScript fonksiyonları**. Reasoning yok, yan etki net. Mevcut `createStore` soyutlamasının (lib/storage) **üstüne oturur** — yani Buddy tool'ları aynı store'ları kullanır, paralel bir veri yolu açmaz.

### Tool seti (mevcut tracker action'larına birebir karşılık)
```ts
logWater(ml: number)                         // gympal-vitals: waterMl += ml (gün upsert)
logShake(count: number)                      // protein shake → proteinG ekler
logProtein(g: number)                        // gympal-vitals: proteinG
logFood(kcal: number)                        // gympal-vitals: foodKcal
logSteps(n: number)                          // gympal-vitals: steps
logWeight(kg: number)                        // gympal-weight-log (gün upsert)
logMood(level: 1..5)                         // gympal-mood
updateExercise(dayIndex, exerciseId, patch)  // gympal-program-custom: sets/reps/rest
addEquipment(type: EquipmentType, kg?)       // gympal-profile.equipment + (opsiyonel ağırlık notu)
addChecklistItem(label) / toggleChecklist    // gympal-checklist
addTodo(text) / addShopping(text)            // gympal-todos / gympal-shopping
setMeal(day, slot, text)                     // gympal-meals
```
> Liste mevcut `lib/tracker.ts` ve `lib/program-store.ts` action'larına karşılık gelir; yeni veri şeması icat edilmez. Eksik tool çıkarsa aynı store imzasıyla eklenir.

### Her tool için şema
Model'e gönderilen `ToolSchema`: ad, açıklama, parametre tipleri (JSON schema benzeri). Model bu şemalardan hangi tool'u hangi argümanla çağıracağını seçer.

### Akış (örnek)
Kullanıcı cümlesi:
> "hoca 1 set arttırdı, 10 kilo dumbbell ekledi, 1 litre su, 2 shake"

Buddy (Groq) intent çözer → **tek seferde** şu tool çağrılarına çevrilir:
```
updateExercise(set +1)          // bugünün/ilgili egzersizin set sayısı +1
addEquipment('dumbbell', 10)    // profile.equipment'e dumbbell + 10kg notu
logWater(1000)                  // 1 litre = 1000 ml
logShake(2)                     // 2 shake → protein
```
App bu çağrıları **deterministik** uygular, sonra kullanıcıya **görünür onay** gösterir:
> "Şunları yaptım: set +1, dumbbell 10kg eklendi, 1L su, 2 shake. Onaylıyor musun?"

Kullanıcı onaylar (commit) veya geri alır (rollback). Mutasyonlar onaydan önce **dry-run/preview** olarak hazırlanır, onaydan sonra store'a yazılır. (ADHD ilkesi: net durum geri bildirimi + belirsizlik yok.)

---

## 4. Settings UX

AI Companion ekranı **OpenWhispr'ın per task provider seçim mantığına** benzer:
- **Provider seçimi:** Cloud Groq (default) · Kendi API key · On device (ileride, pasif görünür)
- **API key input:** kullanıcının key'i (Groq veya custom)
- **Model seçimi:** seçili provider'ın model listesinden
- Şimdilik **sadece Groq aktif**; diğer slotlar **görünür ama ileri faz** (disabled/coming soon).
- Bu ekran `DESIGN_SYSTEM.md` §9 Settings → AI Companion bölümünün içeriğidir.

---

## 5. Zero Backend

- **Backend yok.** App **doğrudan Groq API'ye** konuşur.
- Key kullanıcının cihazında **MMKV'de** durur (localStorage → MMKV taşımasıyla aynı katman; key ve yapı birebir).
- **Tek dış bağlantı bu** (Groq). Başka sunucu, proxy, telemetri yok.
- Güvenlik notu: key cihazda saklanır; UI'da maskelenir; loglara yazılmaz.

---

## 6. Faz Sırası (Buddy özelinde, onay sonrası)

1. Provider interface + Groq implementasyonu (resolveIntent, model listesi).
2. Tool şemaları + deterministik tool fonksiyonları (createStore üstünde).
3. Preview → onay → commit/rollback akışı + görünür onay UI.
4. Settings AI Companion ekranı (provider/key/model).
5. On device slot UI'da görünür ama pasif bırakılır.

> Bu belge onaylanınca Faz 1 eşleştirme tablosunda Buddy katmanı da (companion mock → Groq provider, in-memory history → opsiyonel MMKV) yer alacak.
