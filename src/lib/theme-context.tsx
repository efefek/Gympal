import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';
import { View } from 'react-native';
import { vars } from 'nativewind';
import { mmkv } from './storage';
import { deriveTheme, defaultTheme, type Theme } from './tokens';

const THEME_KEY = 'theme';

interface StoredTheme {
  bg: string;
  fg: string;
}

interface ThemeContextValue {
  theme: Theme;
  setTheme: (bg: string, fg: string) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function loadStoredTheme(): Theme {
  const raw = mmkv.getString(THEME_KEY);
  if (!raw) return defaultTheme;
  try {
    const { bg, fg } = JSON.parse(raw) as StoredTheme;
    if (typeof bg === 'string' && typeof fg === 'string') return deriveTheme(bg, fg);
  } catch {
    // bozuk değer — varsayılana düş
  }
  return defaultTheme;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(loadStoredTheme);

  const setTheme = useCallback((bg: string, fg: string) => {
    mmkv.set(THEME_KEY, JSON.stringify({ bg, fg }));
    setThemeState(deriveTheme(bg, fg));
  }, []);

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  // NativeWind CSS değişkenlerini runtime'da temaya bağla (className="bg-bg" reaktif olur)
  const cssVars = useMemo(
    () =>
      vars({
        '--bg': theme.bg,
        '--fg': theme.fg,
        '--surface-1': theme.surface1,
        '--surface-2': theme.surface2,
        '--surface-3': theme.surface3,
        '--border': theme.border,
        '--muted': theme.muted,
        '--ink': theme.ink,
        '--ink-text': theme.inkText,
        '--accent': theme.accent,
      }),
    [theme],
  );

  return (
    <ThemeContext.Provider value={value}>
      <View style={[{ flex: 1, backgroundColor: theme.bg }, cssVars]}>{children}</View>
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
