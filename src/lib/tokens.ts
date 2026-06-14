// Tasarım token'ları (oklch → hex/rgb, RN oklch desteklemez)
// DESIGN_SYSTEM.md §2 tek renk sistemi

export const palette = {
  // Varsayılan: siyah + beyaz
  black: '#0a0a0b',
  white: '#f4f4f5',

  // Veri serileri (grafik/gruplama — subway-dot stili)
  seriesRed: '#c97171',
  seriesBlue: '#7195c9',
  seriesGreen: '#71c98a',
  seriesAmber: '#c9a471',
  seriesViolet: '#a471c9',

  // Tek vurgu
  accent: '#c99700',
} as const;

// Temadan türetilen yüzey oranları (fg in bg üstünde opacity)
// Kullanıcı bg+fg seçince bu değerler runtime hesaplanır;
// varsayılan (siyah zemin) hex karşılıkları:
export const defaultTheme = {
  bg: palette.black,
  fg: palette.white,
  surface1: '#141416',
  surface2: '#1c1c1f',
  surface3: '#242428',
  border: '#26262a',
  muted: '#8a8a90',
  ink: palette.white,
  inkText: palette.black,
  accent: palette.accent,
} as const;

export type Theme = typeof defaultTheme;

// Önceden tanımlı tema seçenekleri (kullanıcı zemin+metin seçimi için)
export const PRESET_THEMES: Array<{ label: string; bg: string; fg: string }> = [
  { label: 'Siyah', bg: '#0a0a0b', fg: '#f4f4f5' },
  { label: 'Beyaz', bg: '#fafaf8', fg: '#16161a' },
  { label: 'Gri', bg: '#1a1a1a', fg: '#e8e8e8' },
  { label: 'Krem', bg: '#f5f0e8', fg: '#1a1410' },
  { label: 'Çam', bg: '#0d1f0d', fg: '#e0f0e0' },
  { label: 'Lavanta', bg: '#f0edf8', fg: '#1a1525' },
  { label: 'Deniz', bg: '#0d1a2e', fg: '#e0eaf8' },
];
