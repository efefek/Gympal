import { type ReactNode } from 'react';
import { View, type TextProps } from 'react-native';
import Animated, {
  FadeInDown,
  useReducedMotion,
} from 'react-native-reanimated';

/* RevealText — kelime bazlı staggered reveal (fade + slide-up).
   cult-ui text-animate ilhamı; Reanimated entering ile.
   Bauhaus hero başlıklar için. Reduced-motion'da anında görünür. */

interface Props extends TextProps {
  text: string;
  /** Kelimeler arası gecikme (ms). */
  stagger?: number;
  /** Başlangıç gecikmesi (ms). */
  delay?: number;
  className?: string;
}

export function RevealText({ text, stagger = 55, delay = 80, className, style, ...rest }: Props) {
  const reduced = useReducedMotion();
  const words = text.split(' ');

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
      {words.map((word, i) => (
        <Animated.Text
          key={`${word}-${i}`}
          entering={reduced ? undefined : FadeInDown.delay(delay + i * stagger).springify().damping(18)}
          className={className}
          style={style}
          {...rest}
        >
          {word}
          {i < words.length - 1 ? ' ' : ''}
        </Animated.Text>
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
