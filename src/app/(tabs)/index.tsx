import { useCallback, useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Settings, Play, Plus, ChevronUp } from 'lucide-react-native';

import { PanelPager, type PagerApi } from '@/components/bunker/PanelPager';
import { getProfile, type UserProfile, goalLabels, experienceLabels } from '@/lib/profile';
import { getLifetimeStats } from '@/lib/tracker';
import { getWeekDates, isToday, formatDate, DAY_LABELS, todayWeekIndex } from '@/lib/week';
import { loadProgram, todayDayData } from '@/lib/program-store';
import type { WorkoutProgram } from '@/lib/workout';
import { SERIES } from '@/lib/tokens';
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
    </View>
  );
}

/* ─── Panel 0 — Dashboard ─────────────────────────────────── */

function DashboardPanel({ data, api }: { data: BunkerData; api: PagerApi }) {
  const { theme } = useTheme();
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
    <SafeAreaView edges={['top', 'bottom']} className="flex-1">
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 96 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Top chrome */}
        <View className="flex-row items-center gap-2.5">
          <Pressable
            onPress={() => router.push('/settings')}
            className="size-9 items-center justify-center rounded-full border border-border"
          >
            <Settings size={16} color={theme.muted} />
          </Pressable>
          <Text className="font-mono text-[11px] text-muted" style={{ letterSpacing: 3 }}>
            0{api.index + 1} / 0{api.total}
          </Text>
        </View>

        {/* Hero */}
        <View className="mt-8">
          <Text
            className="font-mono text-[11px] uppercase text-muted mb-3"
            style={{ letterSpacing: 3 }}
          >
            Bunker
          </Text>
          <Text className="font-display text-fg" style={{ fontSize: 64, lineHeight: 60, letterSpacing: -2 }}>
            Hi there
          </Text>
          {profile && (
            <Text className="mt-3 text-base text-muted font-sans">
              {experienceLabels[profile.experience]} · {goalLabels[profile.goal]}
            </Text>
          )}
        </View>

        {/* Stats */}
        {profile && (
          <View className="mt-8 flex-row gap-8">
            <StatItem value={currentWeightKg > 0 ? `${currentWeightKg}` : '—'} unit="kg" label="Weight" dot={SERIES[1]} />
            <StatItem value={`${streak}`} unit="d" label="Streak" dot={SERIES[3]} />
            <StatItem value={`${activeDays}`} unit="" label="Active" dot={SERIES[2]} />
          </View>
        )}

        {/* Calendar */}
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
                const dotColor = SERIES[i % SERIES.length];
                return (
                  <Pressable
                    key={label}
                    onPress={todayFlag ? () => router.push('/program') : undefined}
                    className="flex-1 items-center gap-1.5 rounded-xl py-2.5"
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
                    <Text
                      className="text-[9px] font-medium"
                      style={{ color: todayFlag ? theme.inkText : isWorkout ? theme.fg : theme.muted }}
                    >
                      {label}
                    </Text>
                    <Text
                      className="text-sm font-bold"
                      style={{ color: todayFlag ? theme.inkText : isWorkout ? theme.fg : theme.muted }}
                    >
                      {date.getDate()}
                    </Text>
                    <View
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: isWorkout ? (todayFlag ? theme.inkText : dotColor) : 'transparent',
                      }}
                    />
                  </Pressable>
                );
              })}
            </View>
          </GestureDetector>
        </View>

        {/* Today's plan */}
        <View className="mt-9">
          <Text className="font-mono text-[11px] uppercase text-muted mb-3" style={{ letterSpacing: 3 }}>
            Today's plan
          </Text>
          {today ? (
            <Pressable
              onPress={() => router.push('/program')}
              className="rounded-2xl p-5"
              style={{ backgroundColor: theme.surface1, borderWidth: 1.5, borderColor: theme.border }}
            >
              <Text className="font-bold text-xl text-fg">{today.day.name}</Text>
              <Text className="font-mono text-[11px] text-muted mt-1">
                {today.day.exercises.length} exercises · {today.day.estDuration}
              </Text>
              <View className="flex-row items-center gap-2 mt-4">
                <Play size={16} color={theme.fg} />
                <Text className="font-bold text-sm text-fg">Continue workout</Text>
              </View>
            </Pressable>
          ) : (
            <Pressable
              onPress={() => router.push('/profile/edit')}
              className="rounded-2xl p-5"
              style={{ backgroundColor: theme.surface1, borderWidth: 1.5, borderColor: theme.border }}
            >
              <Text className="font-bold text-lg text-fg">No program yet</Text>
              <View className="flex-row items-center gap-2 mt-3">
                <Plus size={16} color={theme.fg} />
                <Text className="font-bold text-sm text-fg">Create one</Text>
              </View>
            </Pressable>
          )}
        </View>

        {/* Swipe-up hint */}
        <Pressable onPress={() => api.paginate(1)} className="mt-10 items-center gap-1">
          <ChevronUp size={20} color={theme.muted} />
          <Text className="font-mono text-[10px] uppercase text-muted" style={{ letterSpacing: 3 }}>
            Program
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
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
  const todayIdx = program ? todayWeekIndex() % program.daysPerWeek : -1;

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1">
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 96 }}
        showsVerticalScrollIndicator={false}
      >
        <Pressable onPress={() => api.paginate(-1)} className="flex-row items-center gap-2 self-start">
          <ChevronUp size={16} color={theme.muted} />
          <Text className="font-mono text-[10px] uppercase text-muted" style={{ letterSpacing: 3 }}>
            Dashboard
          </Text>
        </Pressable>

        {!program ? (
          <View className="mt-12">
            <Text className="font-mono text-[11px] uppercase text-muted mb-3" style={{ letterSpacing: 3 }}>
              Program
            </Text>
            <Text className="font-display text-5xl text-fg mb-6" style={{ letterSpacing: -2 }}>
              No program
            </Text>
            <Pressable
              onPress={() => router.push('/profile/edit')}
              className="flex-row items-center gap-2 rounded-full px-6 py-3 self-start"
              style={{ backgroundColor: theme.ink }}
            >
              <Plus size={16} color={theme.inkText} />
              <Text className="font-bold text-sm" style={{ color: theme.inkText }}>
                Create one
              </Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View className="mt-7">
              <Text className="font-mono text-[11px] uppercase text-muted mb-3" style={{ letterSpacing: 3 }}>
                Program
              </Text>
              <Text className="font-display text-5xl text-fg" style={{ letterSpacing: -2, lineHeight: 48 }}>
                {program.name}
              </Text>
              <Text className="mt-3 font-mono text-[11px] text-muted">{program.daysPerWeek} days / week</Text>
            </View>

            <View className="mt-7 gap-2.5">
              {program.days.map((day, i) => {
                const isCurrentDay = i === todayIdx;
                const color = SERIES[i % SERIES.length];
                return (
                  <Pressable
                    key={i}
                    onPress={() => router.push('/program')}
                    className="flex-row items-center gap-3.5 rounded-xl px-3.5 py-3"
                    style={{
                      backgroundColor: isCurrentDay ? theme.surface2 : theme.surface1,
                      borderWidth: 1.5,
                      borderColor: isCurrentDay ? color : theme.border,
                    }}
                  >
                    <View
                      className="size-9 items-center justify-center rounded-full"
                      style={{ backgroundColor: color }}
                    >
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
              className="mt-6 items-center justify-center rounded-full py-3"
              style={{ backgroundColor: theme.ink }}
            >
              <Text className="font-bold text-sm" style={{ color: theme.inkText }}>
                Edit full program
              </Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
