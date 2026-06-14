import { useRef, useMemo } from 'react';
import { View, Text, ScrollView, useWindowDimensions, type NativeSyntheticEvent, type NativeScrollEvent } from 'react-native';
import { useTheme } from '@/lib/theme-context';
import { Fonts } from '@/lib/tokens';

/* betterFit tarzı yatay cetvel seçici (boy/kilo/hedef için).
   Ortada sabit accent gösterge; kaydırınca değer değişir, snap'ler. */

const TICK_W = 10;

interface Props {
  value: number;
  min: number;
  max: number;
  step?: number;
  unit: string;
  onChange: (v: number) => void;
  /** Kompakt mod: küçük sayı + kısa tick'ler (Diet adımı intake için). */
  compact?: boolean;
}

export function HorizontalRuler({ value, min, max, step = 1, unit, onChange, compact = false }: Props) {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const sidePad = width / 2 - 12;
  const valueSize = compact ? 30 : 56;
  const indicatorH = compact ? 28 : 44;
  const hMajor = compact ? 22 : 36;
  const hMid = compact ? 15 : 24;
  const hMin = compact ? 9 : 14;

  const valueToOffset = (v: number) => ((v - min) / step) * TICK_W;
  // İlk scroll pozisyonu yalnız mount'ta — value değişince RESETLENMEZ (bug fix)
  const initialOffset = useRef(valueToOffset(value)).current;

  const ticks = useMemo(() => {
    const arr: number[] = [];
    for (let v = min; v <= max; v += step) arr.push(v);
    return arr;
  }, [min, max, step]);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const idx = Math.round(x / TICK_W);
    const v = Math.min(max, Math.max(min, min + idx * step));
    if (v !== value) onChange(v);
  };

  return (
    <View>
      {/* Büyük değer */}
      <View className="flex-row items-end justify-center mb-3">
        <Text style={{ fontFamily: Fonts.display, color: theme.fg, fontSize: valueSize, letterSpacing: -2 }}>
          {value}
        </Text>
        <Text className="font-mono text-sm text-muted mb-2 ml-1.5">{unit}</Text>
      </View>

      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentOffset={{ x: initialOffset, y: 0 }}
          contentContainerStyle={{ paddingHorizontal: sidePad }}
          snapToInterval={TICK_W}
          decelerationRate="fast"
          onScroll={handleScroll}
          onMomentumScrollEnd={handleScroll}
          scrollEventThrottle={16}
        >
          {ticks.map((v, i) => {
            const major = i % 10 === 0;
            const mid = i % 5 === 0;
            return (
              <View key={v} style={{ width: TICK_W, alignItems: 'center', justifyContent: 'flex-start' }}>
                <View
                  style={{
                    width: 1.5,
                    height: major ? hMajor : mid ? hMid : hMin,
                    backgroundColor: major ? theme.fg : theme.muted,
                    opacity: major ? 0.9 : 0.4,
                    borderRadius: 1,
                  }}
                />
                {major && (
                  <Text className="font-mono text-[9px] text-muted mt-1" style={{ width: 30, textAlign: 'center', marginLeft: -15 + TICK_W / 2 }}>
                    {v}
                  </Text>
                )}
              </View>
            );
          })}
        </ScrollView>

        {/* Ortadaki sabit gösterge */}
        <View
          pointerEvents="none"
          style={{ position: 'absolute', top: 0, left: '50%', marginLeft: -1.5, width: 3, height: indicatorH, backgroundColor: theme.accent, borderRadius: 2 }}
        />
      </View>
    </View>
  );
}
