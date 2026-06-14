import { useCallback, useState, type ReactNode } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  type SharedValue,
} from 'react-native-reanimated';
import { Play, Plus, ChevronUp } from 'lucide-react-native';

import { PanelPager, type PagerApi } from '@/components/bunker/PanelPager';
import { ScreenChrome } from '@/components/chrome/ScreenChrome';
import { RevealText, RevealBlock } from '@/components/ui/RevealText';
import { getProfile, type UserProfile, goalLabels, experienceLabels } from '@/lib/profile';
import { getLifetimeStats } from '@/lib/tracker';
import { getWeekDates, isToday, formatDate, DAY_LABELS, todayWeekIndex } from '@/lib/week';
import { loadProgram, todayDayData } from '@/lib/program-store';
import type { WorkoutProgram } from '@/lib/workout';
import { SERIES, Fonts } from '@/lib/tokens';
import { useTheme } from '@/lib/theme-context';

interface BunkerData {
  profile: UserProfile | null;
  program: WorkoutProgram | null;
  currentWeightKg: number;
  activeDays: number;
  streak: number;
}

function readData(): BunkerData {
  const ls = getLifetimeStats();
  return {
    profile: getProfile(),
    program: loadProgram(),
    currentWeightKg: ls.currentWeightKg,
    activeDays: ls.activeDays,
    streak: ls.currentStreak,
  };
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 6) return 'Still up';
  if (h < 12) return 'Good\nmorning';
  if (h < 18) return 'Good\nafternoon';
  return 'Good\nevening';
}

export default function BunkerScreen() {
  const [data, setData] = useState<BunkerData>(readData);
  useFocusEffect(useCallback(() => setData(readData()), []));

  return (
    <View className="flex-1 bg-bg">
      <PanelPager
        panels={[
          (api) => <DashboardPanel data={data} api={api} />,
          (api) => <ProgramPanel program={data.program} api={api} />,
        ]}
      />
      <ScreenChrome />
    </View>
  );
}

/* Parallax katmanı: panel geçişinde her blok farklı hızda kayar.
   factor büyüdükçe katman daha hızlı (daha derinde) hissedilir. */
function ParallaxLayer({
  progress,
  panelIndex,
  factor,
  children,
}: {
  progress: SharedValue<number>;
  panelIndex: number;
  factor: number;
  children: ReactNode;
}) {
  const style = useAnimatedStyle(() => {
    const rel = progress.value - panelIndex;
    const translateY = interpolate(rel, [-1, 0, 1], [factor, 0, -factor], Extrapolation.CLAMP);
    return { transform: [{ translateY }] };
  });
  return <Animated.View style={style}>{children}</Animated.View>;
}

/* ─── Panel 0 — Dashboard ─────────────────────────────────── */

function DashboardPanel({ data, api }: { data: BunkerData; api: PagerApi }) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { profile, program, currentWeightKg, activeDays, streak } = data;
  const [weekOffset, setWeekOffset] = useState(0);
  const daysPerWeek = program?.daysPerWeek ?? 3;

  const refDate = new Date();
  refDate.setDate(refDate.getDate() + weekOffset * 7);
  const weekDates = getWeekDates(refDate);
  const today = todayDayData(program ?? { name: '', description: '', daysPerWeek: 3, days: [] });

  const weekPan = Gesture.Pan()
    .activeOffsetX([-15, 15])
    .failOffsetY([-15, 15])
    .onEnd((e) => {
      if (e.translationX < -50) setWeekOffset((w) => w + 1);
      else if (e.translationX > 50) setWeekOffset((w) => w - 1);
    });

  return (
    <ScrollView
      contentContainerStyle={{ paddingHorizontal: 24, paddingTop: insets.top + 64, paddingBottom: 110 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero — bauhaus dev başlık (parallax: yavaş) */}
      <ParallaxLayer progress={api.progress} panelIndex={0} factor={18}>
        <Text className="font-mono text-[11px] uppercase text-muted mb-3" style={{ letterSpacing: 3 }}>
          Bunker
        </Text>
        <RevealText
          text={greeting()}
          style={{ fontFamily: Fonts.display, color: theme.fg, fontSize: 60, lineHeight: 58, letterSpacing: -2.5 }}
        />
        {profile && (
          <RevealBlock delay={260}>
            <Text className="mt-3 text-base text-muted font-sans">
              {experienceLabels[profile.experience]} · {goalLabels[profile.goal]}
            </Text>
          </RevealBlock>
        )}
      </ParallaxLayer>

      {/* Stats (parallax: orta) */}
      {profile && (
        <ParallaxLayer progress={api.progress} panelIndex={0} factor={45}>
          <RevealBlock delay={320}>
            <View className="mt-8 flex-row gap-8">
              <StatItem value={currentWeightKg > 0 ? `${currentWeightKg}` : '—'} unit="kg" label="Weight" dot={SERIES[1]} />
              <StatItem value={`${streak}`} unit="d" label="Streak" dot={theme.accent} />
              <StatItem value={`${activeDays}`} unit="" label="Active" dot={SERIES[2]} />
            </View>
          </RevealBlock>
        </ParallaxLayer>
      )}

      {/* Calendar (parallax: hızlı) */}
      <ParallaxLayer progress={api.progress} panelIndex={0} factor={75}>
        <RevealBlock delay={profile ? 380 : 300}>
          <View className="mt-9">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="font-mono text-[11px] uppercase text-muted" style={{ letterSpacing: 3 }}>
                {weekOffset === 0 ? 'This week' : weekOffset < 0 ? `${-weekOffset}w ago` : `+${weekOffset}w`}
              </Text>
              <Text className="font-mono text-[10px] text-muted" style={{ letterSpacing: 1 }}>
                ‹ swipe ›
              </Text>
            </View>

            <GestureDetector gesture={weekPan}>
              <View className="flex-row gap-1.5">
                {DAY_LABELS.map((label, i) => {
                  const date = weekDates[i];
                  const todayFlag = isToday(date);
                  const isWorkout = i < daysPerWeek;
                  const dotColor = i === todayWeekIndex() ? theme.accent : SERIES[i % SERIES.length];
                  return (
                    <Pressable
                      key={label}
                      onPress={todayFlag ? () => router.push('/program') : undefined}
                      className="flex-1 items-center gap-1.5 rounded-2xl py-2.5"
                      style={
                        todayFlag
                          ? { backgroundColor: theme.ink }
                          : {
                              backgroundColor: isWorkout ? theme.surface1 : 'transparent',
                              borderWidth: 1.5,
                              borderColor: isWorkout ? theme.border : 'transparent',
                            }
                      }
                    >
                      <Text className="text-[9px] font-medium" style={{ color: todayFlag ? theme.inkText : isWorkout ? theme.fg : theme.muted }}>
                        {label}
                      </Text>
                      <Text className="text-sm font-bold" style={{ color: todayFlag ? theme.inkText : isWorkout ? theme.fg : theme.muted }}>
                        {date.getDate()}
                      </Text>
                      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: isWorkout ? (todayFlag ? theme.inkText : dotColor) : 'transparent' }} />
                    </Pressable>
                  );
                })}
              </View>
            </GestureDetector>
          </View>
        </RevealBlock>
      </ParallaxLayer>

      {/* Today's plan (parallax: en hızlı) */}
      <ParallaxLayer progress={api.progress} panelIndex={0} factor={110}>
        <RevealBlock delay={profile ? 440 : 360}>
          <View className="mt-9">
            <Text className="font-mono text-[11px] uppercase text-muted mb-3" style={{ letterSpacing: 3 }}>
              Today's plan
            </Text>
            {today ? (
              <Pressable
                onPress={() => router.push('/program')}
                className="rounded-3xl p-5"
                style={{ backgroundColor: theme.accent }}
              >
                <Text className="font-display text-2xl" style={{ color: '#0a0a0b', letterSpacing: -1 }}>
                  {today.day.name}
                </Text>
                <Text className="font-mono text-[11px] mt-1" style={{ color: '#0a0a0b', opacity: 0.7 }}>
                  {today.day.exercises.length} exercises · {today.day.estDuration}
                </Text>
                <View className="flex-row items-center gap-2 mt-4">
                  <Play size={16} color="#0a0a0b" fill="#0a0a0b" />
                  <Text className="font-bold text-sm" style={{ color: '#0a0a0b' }}>
                    Continue workout
                  </Text>
                </View>
              </Pressable>
            ) : (
              <Pressable
                onPress={() => router.push('/profile/edit')}
                className="rounded-3xl p-5"
                style={{ backgroundColor: theme.surface1, borderWidth: 1.5, borderColor: theme.border }}
              >
                <Text className="font-display text-xl text-fg" style={{ letterSpacing: -0.5 }}>
                  No program yet
                </Text>
                <View className="flex-row items-center gap-2 mt-3">
                  <Plus size={16} color={theme.fg} />
                  <Text className="font-bold text-sm text-fg">Create one</Text>
                </View>
              </Pressable>
            )}
          </View>

          <Pressable onPress={() => api.paginate(1)} className="mt-10 items-center gap-1">
            <ChevronUp size={20} color={theme.muted} />
            <Text className="font-mono text-[10px] uppercase text-muted" style={{ letterSpacing: 3 }}>
              Program
            </Text>
          </Pressable>
        </RevealBlock>
      </ParallaxLayer>
    </ScrollView>
  );
}

function StatItem({ value, unit, label, dot }: { value: string; unit: string; label: string; dot: string }) {
  const { theme } = useTheme();
  return (
    <View>
      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: dot, marginBottom: 8 }} />
      <Text className="font-display text-3xl text-fg" style={{ letterSpacing: -1 }}>
        {value}
        {unit ? <Text className="text-base font-sans text-muted"> {unit}</Text> : null}
      </Text>
      <Text className="font-mono text-[10px] uppercase text-muted mt-1.5" style={{ letterSpacing: 1 }}>
        {label}
      </Text>
    </View>
  );
}

/* ─── Panel 1 — Program ───────────────────────────────────── */

function ProgramPanel({ program, api }: { program: WorkoutProgram | null; api: PagerApi }) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const todayIdx = program ? todayWeekIndex() % program.daysPerWeek : -1;

  return (
    <ScrollView
      contentContainerStyle={{ paddingHorizontal: 24, paddingTop: insets.top + 64, paddingBottom: 110 }}
      showsVerticalScrollIndicator={false}
    >
      <ParallaxLayer progress={api.progress} panelIndex={1} factor={20}>
        <Pressable onPress={() => api.paginate(-1)} className="flex-row items-center gap-2 self-start mb-7">
          <ChevronUp size={16} color={theme.muted} />
          <Text className="font-mono text-[10px] uppercase text-muted" style={{ letterSpacing: 3 }}>
            Dashboard
          </Text>
        </Pressable>

        {!program ? (
          <View>
            <Text className="font-mono text-[11px] uppercase text-muted mb-3" style={{ letterSpacing: 3 }}>
              Program
            </Text>
            <RevealText text={'No\nprogram'} style={{ fontFamily: Fonts.display, color: theme.fg, fontSize: 52, lineHeight: 50, letterSpacing: -2 }} />
            <Pressable
              onPress={() => router.push('/profile/edit')}
              className="flex-row items-center gap-2 rounded-full px-6 py-3 self-start mt-6"
              style={{ backgroundColor: theme.accent }}
            >
              <Plus size={16} color="#0a0a0b" />
              <Text className="font-bold text-sm" style={{ color: '#0a0a0b' }}>
                Create one
              </Text>
            </Pressable>
          </View>
        ) : (
          <>
            <Text className="font-mono text-[11px] uppercase text-muted mb-3" style={{ letterSpacing: 3 }}>
              Program
            </Text>
            <RevealText text={program.name} style={{ fontFamily: Fonts.display, color: theme.fg, fontSize: 44, lineHeight: 44, letterSpacing: -2 }} />
            <Text className="mt-3 font-mono text-[11px] text-muted">{program.daysPerWeek} days / week</Text>
          </>
        )}
      </ParallaxLayer>

      {program && (
        <ParallaxLayer progress={api.progress} panelIndex={1} factor={70}>
          <View className="mt-7 gap-2.5">
            {program.days.map((day, i) => {
              const isCurrentDay = i === todayIdx;
              const color = isCurrentDay ? theme.accent : SERIES[i % SERIES.length];
              return (
                <Pressable
                  key={i}
                  onPress={() => router.push('/program')}
                  className="flex-row items-center gap-3.5 rounded-2xl px-3.5 py-3"
                  style={{
                    backgroundColor: isCurrentDay ? theme.surface2 : theme.surface1,
                    borderWidth: 1.5,
                    borderColor: isCurrentDay ? theme.accent : theme.border,
                  }}
                >
                  <View className="size-9 items-center justify-center rounded-full" style={{ backgroundColor: color }}>
                    <Text className="font-mono text-xs font-bold" style={{ color: '#0a0a0b' }}>
                      0{i + 1}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="font-bold text-[15px] text-fg" numberOfLines={1}>
                      {day.name}
                    </Text>
                    <Text className="font-mono text-[10px] text-muted mt-0.5">
                      {day.exercises.length} exercises{isCurrentDay ? ' · today' : ''}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            onPress={() => router.push('/program')}
            className="mt-6 items-center justify-center rounded-full py-3.5"
            style={{ backgroundColor: theme.ink }}
          >
            <Text className="font-bold text-sm" style={{ color: theme.inkText }}>
              Edit full program
            </Text>
          </Pressable>
        </ParallaxLayer>
      )}
    </ScrollView>
  );
}
