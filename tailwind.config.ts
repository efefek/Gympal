import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        fg: 'var(--fg)',
        surface1: 'var(--surface-1)',
        surface2: 'var(--surface-2)',
        surface3: 'var(--surface-3)',
        border: 'var(--border)',
        muted: 'var(--muted)',
        ink: 'var(--ink)',
        'ink-text': 'var(--ink-text)',
        accent: 'var(--accent)',
        // veri serileri (grafik/gruplama)
        'series-red': '#c97171',
        'series-blue': '#7195c9',
        'series-green': '#71c98a',
        'series-amber': '#c9a471',
        'series-violet': '#a471c9',
      },
      fontFamily: {
        sans: ['GeistSans', 'system-ui', 'sans-serif'],
        mono: ['GeistMono', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
