import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Activity, Flame, Droplet, CalendarDays } from 'lucide-react-native';
import { useTheme } from '@/lib/theme-context';
import { getLifetimeStats, getVitals, todayKey } from '@/lib/tracker';
import { loadProgram, todayDayData } from '@/lib/program-store';
import { getProfile } from '@/lib/profile';

/* Sol üst durum çapası — kapalı blok → tap: ADHD-friendly özet panel.
   Bugünkü plan, streak, su/intake. DESIGN_SYSTEM §1 / §11.5. */

export function StatusRibbon() {
  const { theme } = useTheme();
  const [open, setOpen] = useState(false);

  const stats = getLifetimeStats();
  const program = loadProgram();
  const today = program ? todayDayData(program) : null;
  const profile = getProfile();
  const todayVital = getVitals().find((v) => v.date === todayKey());
  const waterMl = todayVital?.waterMl ?? 0;
  const waterTarget = profile?.dailyWaterMlTarget ?? 2500;

  return (
    <>
      {/* Kapalı blok */}
      <Pressable
        onPress={() => setOpen((o) => !o)}
        hitSlop={8}
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.surface2,
          borderWidth: 1.5,
          borderColor: theme.border,
        }}
      >
        <Activity size={20} color={theme.fg} />
      </Pressable>

      {open && (
        <>
          <Pressable
            onPress={() => setOpen(false)}
            style={{ position: 'absolute', top: -200, left: -40, right: -400, bottom: -800 }}
          />
          <Animated.View
            entering={FadeInDown.springify().damping(20)}
            style={{
              position: 'absolute',
              top: 48,
              left: 0,
              width: 240,
              borderRadius: 18,
              backgroundColor: theme.surface1,
              borderWidth: 1.5,
              borderColor: theme.border,
              padding: 16,
              gap: 14,
            }}
          >
            <Row
              icon={<CalendarDays size={16} color={theme.muted} />}
              label="Today"
              value={today ? today.day.name : 'Rest / no plan'}
              theme={theme}
            />
            <Row
              icon={<Flame size={16} color={theme.accent} />}
              label="Streak"
              value={`${stats.currentStreak} days`}
              theme={theme}
            />
            <Row
              icon={<Droplet size={16} color={theme.muted} />}
              label="Water"
              value={`${waterMl} / ${waterTarget} ml`}
              theme={theme}
            />
          </Animated.View>
        </>
      )}
    </>
  );
}

function Row({
  icon,
  label,
  value,
  theme,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  theme: { fg: string; muted: string };
}) {
  return (
    <View className="flex-row items-center gap-3">
      {icon}
      <View className="flex-1">
        <Text className="font-mono text-[9px] uppercase" style={{ color: theme.muted, letterSpacing: 1 }}>
          {label}
        </Text>
        <Text className="font-bold text-sm mt-0.5" style={{ color: theme.fg }} numberOfLines={1}>
          {value}
        </Text>
      </View>
    </View>
  );
}
