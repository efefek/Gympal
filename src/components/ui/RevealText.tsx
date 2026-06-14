import { type ReactNode } from 'react';
import { View, type TextStyle, type StyleProp } from 'react-native';
import Animated, {
  FadeInDown,
  useReducedMotion,
} from 'react-native-reanimated';

/* RevealText — kelime bazlı staggered reveal (fade + slide-up).
   cult-ui text-animate ilhamı; Reanimated entering ile.
   Bauhaus hero başlıklar için. Reduced-motion'da anında görünür.
   NOT: Animated.Text NativeWind className'i almaz — renk/font style ile verilir. */

interface Props {
  text: string;
  /** color, fontFamily, fontSize vb. — Animated.Text className almadığı için style zorunlu. */
  style?: StyleProp<TextStyle>;
  /** Kelimeler arası gecikme (ms). */
  stagger?: number;
  /** Başlangıç gecikmesi (ms). */
  delay?: number;
}

export function RevealText({ text, style, stagger = 55, delay = 80 }: Props) {
  const reduced = useReducedMotion();
  // Satır kırılımlarını koru: "\n" içeren metinde her kelime bloğu sırayla gelir
  const segments = text.split('\n');

  let wordCounter = 0;
  return (
    <View>
      {segments.map((line, lineIdx) => (
        <View key={lineIdx} style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {line.split(/\s+/).filter(Boolean).map((word, i) => {
            const idx = wordCounter++;
            return (
              <Animated.Text
                key={`${word}-${lineIdx}-${i}`}
                entering={reduced ? undefined : FadeInDown.delay(delay + idx * stagger).springify().damping(18)}
                style={style}
              >
                {word}
                {' '}
              </Animated.Text>
            );
          })}
        </View>
      ))}
    </View>
  );
}

/** Tek satır olmayan, blok reveal (kart/bölüm girişleri için). */
export function RevealBlock({
  children,
  delay = 0,
}: {
  children: ReactNode;
  delay?: number;
}) {
  const reduced = useReducedMotion();
  return (
    <Animated.View entering={reduced ? undefined : FadeInDown.delay(delay).springify().damping(20)}>
      {children}
    </Animated.View>
  );
}
