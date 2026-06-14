import { type ReactNode } from 'react';
import { useWindowDimensions, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  useReducedMotion,
  interpolate,
  Extrapolation,
  type SharedValue,
} from 'react-native-reanimated';

/* PanelPager — dikey gesture pager (2 panel).
   Swipe-up → sonraki panel (mevcut yukarı kayar + scale-down + fade,
   yeni alttan gelir). Swipe-down → önceki. ease-in-out [0.45,0,0.55,1].
   Reduced motion: sadece opacity, drag kapalı. Legacy ile birebir eşik. */

const SWIPE_OFFSET = 70;
const SWIPE_VELOCITY = 400;
const DURATION = 480;
const EASE = Easing.bezier(0.45, 0, 0.55, 1);

export interface PagerApi {
  index: number;
  total: number;
  paginate: (dir: number) => void;
  /** 0..count-1 arası canlı geçiş değeri — parallax katmanları buna bağlanır. */
  progress: SharedValue<number>;
}

interface Props {
  panels: Array<(api: PagerApi) => ReactNode>;
}

export function PanelPager({ panels }: Props) {
  const { height } = useWindowDimensions();
  const reduced = useReducedMotion();
  const count = panels.length;

  // progress: 0 = panel0 tam görünür, 1 = panel1 tam görünür
  const progress = useSharedValue(0);
  const startProgress = useSharedValue(0);

  const paginate = (dir: number) => {
    'worklet';
    const target = Math.max(0, Math.min(count - 1, Math.round(progress.value) + dir));
    progress.value = withTiming(target, { duration: DURATION, easing: EASE });
  };

  const pan = Gesture.Pan()
    .enabled(!reduced && count > 1)
    .activeOffsetY([-12, 12])
    .failOffsetX([-20, 20])
    .onBegin(() => {
      startProgress.value = progress.value;
    })
    .onUpdate((e) => {
      const next = startProgress.value - e.translationY / height;
      progress.value = Math.max(0, Math.min(count - 1, next));
    })
    .onEnd((e) => {
      const goingUp = e.translationY < -SWIPE_OFFSET || e.velocityY < -SWIPE_VELOCITY;
      const goingDown = e.translationY > SWIPE_OFFSET || e.velocityY > SWIPE_VELOCITY;
      let target = Math.round(progress.value);
      if (goingUp) target = Math.min(count - 1, Math.floor(startProgress.value) + 1);
      else if (goingDown) target = Math.max(0, Math.ceil(startProgress.value) - 1);
      progress.value = withTiming(target, { duration: DURATION, easing: EASE });
    });

  const content = (
    <Animated.View style={styles.root}>
      {panels.map((render, i) => (
        <PanelLayer key={i} index={i} progress={progress} height={height} reduced={reduced}>
          {render({ index: i, total: count, paginate, progress })}
        </PanelLayer>
      ))}
    </Animated.View>
  );

  return <GestureDetector gesture={pan}>{content}</GestureDetector>;
}

interface LayerProps {
  index: number;
  progress: SharedValue<number>;
  height: number;
  reduced: boolean;
  children: ReactNode;
}

function PanelLayer({ index, progress, height, reduced, children }: LayerProps) {
  // local: panel'in görünürlük oranı (0..1), kendi index'ine göre
  const animatedStyle = useAnimatedStyle(() => {
    // p: bu panel ne kadar "geçilmiş" (önceki yön) ya da "gelmekte" (sonraki yön)
    const rel = progress.value - index; // 0 = tam ortada, +1 = bir sonraki tam, -1 = bir önceki
    const opacity = interpolate(rel, [-1, 0, 1], [0, 1, 0], Extrapolation.CLAMP);
    if (reduced) {
      return { opacity, zIndex: Math.abs(rel) < 0.5 ? 1 : 0 };
    }
    const translateY = interpolate(
      rel,
      [-1, 0, 1],
      [height * 0.07, 0, -height * 0.07],
      Extrapolation.CLAMP,
    );
    const scale = interpolate(rel, [-1, 0, 1], [1.03, 1, 0.97], Extrapolation.CLAMP);
    return {
      opacity,
      transform: [{ translateY }, { scale }],
      zIndex: Math.abs(rel) < 0.5 ? 1 : 0,
    };
  });

  return <Animated.View style={[styles.layer, animatedStyle]}>{children}</Animated.View>;
}

const styles = StyleSheet.create({
  root: { flex: 1, overflow: 'hidden' },
  layer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
});
