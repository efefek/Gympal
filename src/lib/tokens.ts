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

export interface Theme {
  bg: string;
  fg: string;
  surface1: string;
  surface2: string;
  surface3: string;
  border: string;
  muted: string;
  ink: string;
  inkText: string;
  accent: string;
}

// Temadan türetilen yüzey oranları (fg in bg üstünde opacity)
// Kullanıcı bg+fg seçince bu değerler runtime hesaplanır;
// varsayılan (siyah zemin) hex karşılıkları:
export const defaultTheme: Theme = {
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
};

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

/* ─── Renk türetme (RN oklch/mix desteklemez, hex hesabı) ──── */

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  const c = (v: number) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}

/** `a` rengini `b` üstüne `t` oranında karıştırır (a*t + b*(1-t)). */
export function mix(a: string, b: string, t: number): string {
  const [ar, ag, ab] = hexToRgb(a);
  const [br, bg, bb] = hexToRgb(b);
  return rgbToHex(ar * t + br * (1 - t), ag * t + bg * (1 - t), ab * t + bb * (1 - t));
}

/** Kullanıcının seçtiği bg+fg'den tüm tema token'larını türetir (DESIGN_SYSTEM §2). */
export function deriveTheme(bg: string, fg: string): Theme {
  return {
    bg,
    fg,
    surface1: mix(fg, bg, 0.05),
    surface2: mix(fg, bg, 0.09),
    surface3: mix(fg, bg, 0.14),
    border: mix(fg, bg, 0.15),
    muted: mix(fg, bg, 0.45),
    ink: fg,
    inkText: bg,
    accent: palette.accent,
  };
}

export const SERIES = [
  palette.seriesRed,
  palette.seriesBlue,
  palette.seriesGreen,
  palette.seriesAmber,
  palette.seriesViolet,
] as const;

/* ─── Font haritası (expo-google-fonts/geist) ──────────────── */

export const Fonts = {
  sans: 'Geist_400Regular',
  medium: 'Geist_500Medium',
  bold: 'Geist_700Bold',
  display: 'Geist_900Black',
  mono: 'GeistMono_400Regular',
  monoMedium: 'GeistMono_500Medium',
} as const;
