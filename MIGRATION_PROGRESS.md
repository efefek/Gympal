# GymPal Migration — İlerleme Logu

> Next.js web (`gympal-legacy`) → React Native + Expo (`gympal`) taşıma süreci.
> Yeni oturum buradan devam etmeli. Detay belgeleri: `MIGRATION_MAP.md`, `DESIGN_SYSTEM.md`, `BUDDY_ARCHITECTURE.md`.

## Faz Durumu

| Faz | Konu | Durum |
|-----|------|-------|
| Faz -1 | Eski projeyi `gympal-legacy` olarak rename | TAMAM |
| Faz 0 | Legacy analizi → `MIGRATION_MAP.md` | TAMAM (onaylandı) |
| Tasarım/Mimari | `DESIGN_SYSTEM.md` + `BUDDY_ARCHITECTURE.md` | TAMAM (kullanıcıya sunuldu) |
| Faz 1 | Eşleştirme tablosu (web → native) | TAMAM (onaylandı) |
| Faz 2 | Kurulum (NativeWind, MMKV, lucide-react-native, react-native-maps) + klasör iskeleti | TAMAM |
| Faz 3 | Logic + navigasyon iskeleti (MMKV persistence, MuscleWiki cache) | TAMAM |
| Faz 4 | UI'ı ekran ekran native+güçlü yeniden çiz (Reanimated 3 gesture) | bekliyor |

## 2026-06-14 Session Özeti (Opus)

Yapılanlar:
1. `gym-webapp` → `gympal-legacy` rename edildi. Kilit kaynağı VS Code'du; kullanıcı onayıyla VS Code process'leri kapatıldı (MCP/Claude Code node process'lerine dokunulmadı), rename doğrulandı.
2. `gympal-legacy` salt-okunur tarandı; `MIGRATION_MAP.md` yazıldı: route/sayfa yapısı, navigasyon akışı, her sayfanın business logic'i, localStorage şeması (10 `gympal-*` key birebir + tipler), MuscleWiki yerel veri akışı (exercises.json 1323 kayıt), Leaflet kullanımı, tüm design token'lar.
3. Kullanıcı tasarım/mimari kararları verdi → `DESIGN_SYSTEM.md` ve `BUDDY_ARCHITECTURE.md` yazıldı.

Kullanıcı kararları (özet, belgelerde tam hali):
- BottomNav 4 sekme, FAB YOK: Bunker, Vitals (eski Body), Buddy (eski Companion), Social. Maps kaldırıldı, harita Social içinde sade. Profile sağ üst ikon.
- İki sabit "çapa ribbon": sol = durum/zaman, sağ = kimlik/ayar. Kapalıyken köşelerde siyah blok.
- Tek renk tema sistemi: `--bg` + `--fg` çekirdek, geri kalan türetilir. Kullanıcı zemin+metin seçer (siyah/beyaz/pastel). Tüm app aynı zemin.
- Social renk istisnası sadece kart seviyesi (event kartları turuncu/sarı zemin, siyah bold typo).
- Neon/brutalist tamamen silinecek.
- Social = yatay 3 panel pager (feed / events / find a pal). Find a pal cinsiyetsiz aktivite eşleşmesi.
- ADHD friendly ilkeler omurga (7 madde). Buddy "tek cümle → tool calls" en öne çıkan özellik.
- Buddy: model agnostik provider interface, Groq default/aktif, custom key opsiyonel, on-device boş slot. Tool calling deterministik TS fonksiyonları, createStore üstünde. Zero backend, key MMKV'de.
- Settings: clear-data bug fix (measurements + vitals eklenecek), Google Health dummy, AI Companion = Groq key+model.

## Değişmez Kurallar (tüm fazlar)
- `gympal-legacy`'ye DOKUNMA (sadece oku). Migration bitince silinebilir.
- localStorage → MMKV: key ve veri yapısı BİREBİR korunur.
- Zero-backend kalır, backend eklenmez (tek dış bağlantı Buddy → Groq).
- Her fazı bitince DUR ve onay bekle.
- Expo SDK 56 — kod yazmadan önce https://docs.expo.dev/versions/v56.0.0/ oku (AGENTS.md kuralı).
- Türkçe yanıt, emoji yok.

## Sıradaki Adım
Faz 1: `MIGRATION_MAP.md` + `DESIGN_SYSTEM.md` + `BUDDY_ARCHITECTURE.md` üstüne oturan eşleştirme tablosu.
Next App Router → Expo Router, div/span → View/Text, CSS → NativeWind, motion/react → Reanimated 3 + gesture-handler,
Leaflet → react-native-maps, localStorage → MMKV, lucide-react → lucide-react-native, Vitest → Jest + RN Testing Library.
Göster, onay bekle.
