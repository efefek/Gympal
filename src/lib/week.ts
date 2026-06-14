/* ─── Hafta yardımcıları ─────────────────────────────────────
   Saf fonksiyonlar — program/page.tsx ve Bunker takvimi paylaşır.
   Yan etki yok, localStorage'a dokunmaz. */

export const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const
export type DayLabel = (typeof DAY_LABELS)[number]

/** Verilen bir tarihin haftasının Pazartesi'sinden başlayan 7 günü döner. */
export function getWeekDates(ref: Date = new Date()): Date[] {
  const start = new Date(ref)
  const day = start.getDay()
  const diff = start.getDate() - day + (day === 0 ? -6 : 1)
  start.setDate(diff)
  start.setHours(0, 0, 0, 0)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return d
  })
}

/** Verilen tarihin bugün olup olmadığını kontrol eder. */
export function isToday(d: Date): boolean {
  const t = new Date()
  return d.toDateString() === t.toDateString()
}

/** "14 Jun" formatında kısa tarih string'i döner. */
export function formatDate(d: Date): string {
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

/** Bugünün haftanın kaçıncı günü olduğunu 0=Pzt, 6=Paz olarak döner. */
export function todayWeekIndex(): number {
  const day = new Date().getDay()
  return day === 0 ? 6 : day - 1
}

/** İki Date'in aynı gün olup olmadığını kontrol eder. */
export function isSameDay(a: Date, b: Date): boolean {
  return a.toDateString() === b.toDateString()
}

/** YYYY-MM-DD formatında lokal tarih string'i döner. */
export function toLocalDateString(d: Date = new Date()): string {
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}
