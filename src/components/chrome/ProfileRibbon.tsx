import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { CircleUserRound, ChevronRight, Settings, SquarePen } from 'lucide-react-native';
import { useTheme } from '@/lib/theme-context';
import { getProfile, goalLabels, experienceLabels } from '@/lib/profile';
import { getLifetimeStats } from '@/lib/tracker';

/* Sağ üst profil çapası — 3 aşama:
   kapalı blok → tap: brief pop-up → tap: tam ekran profil.
   DESIGN_SYSTEM §1 / §11.5. */

export function ProfileRibbon() {
  const { theme } = useTheme();
  const [open, setOpen] = useState(false);
  const profile = getProfile();
  const stats = getLifetimeStats();

  return (
    <>
      {/* Kapalı blok */}
      <Pressable
        onPress={() => setOpen(true)}
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
        <CircleUserRound size={20} color={theme.fg} />
      </Pressable>

      {/* Pop-up brief */}
      {open && (
        <>
          <Pressable
            onPress={() => setOpen(false)}
            style={{ position: 'absolute', top: -200, left: -400, right: -40, bottom: -800 }}
          />
          <Animated.View
            entering={FadeInUp.springify().damping(20)}
            style={{
              position: 'absolute',
              top: 48,
              right: 0,
              width: 220,
              borderRadius: 18,
              backgroundColor: theme.surface1,
              borderWidth: 1.5,
              borderColor: theme.border,
              padding: 16,
            }}
          >
            <Text className="font-display text-2xl text-fg" style={{ letterSpacing: -1 }}>
              {profile ? experienceLabels[profile.experience] : 'Guest'}
            </Text>
            {profile && (
              <Text className="font-mono text-[10px] uppercase text-muted mt-1" style={{ letterSpacing: 1 }}>
                {goalLabels[profile.goal]}
              </Text>
            )}

            <View className="flex-row gap-5 mt-4">
              <Brief label="Streak" value={`${stats.currentStreak}d`} accent={theme.accent} />
              <Brief label="Active" value={`${stats.activeDays}`} accent={theme.fg} />
            </View>

            <Pressable
              onPress={() => {
                setOpen(false);
                router.push('/profile');
              }}
              className="flex-row items-center justify-between mt-4 rounded-xl px-3.5 py-3"
              style={{ backgroundColor: theme.ink }}
            >
              <Text className="font-bold text-sm" style={{ color: theme.inkText }}>
                Full profile
              </Text>
              <ChevronRight size={16} color={theme.inkText} />
            </Pressable>

            <View className="flex-row items-center justify-between mt-3">
              <Pressable
                onPress={() => {
                  setOpen(false);
                  router.push('/profile/edit');
                }}
                className="flex-row items-center gap-2"
                hitSlop={6}
              >
                <SquarePen size={14} color={theme.muted} />
                <Text className="font-mono text-[10px] uppercase text-muted" style={{ letterSpacing: 1 }}>
                  Edit
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setOpen(false);
                  router.push('/settings');
                }}
                className="flex-row items-center gap-2"
                hitSlop={6}
              >
                <Settings size={14} color={theme.muted} />
                <Text className="font-mono text-[10px] uppercase text-muted" style={{ letterSpacing: 1 }}>
                  Settings
                </Text>
              </Pressable>
            </View>
          </Animated.View>
        </>
      )}
    </>
  );
}

function Brief({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <View>
      <Text className="font-display text-xl" style={{ color: accent, letterSpacing: -0.5 }}>
        {value}
      </Text>
      <Text className="font-mono text-[9px] uppercase text-muted mt-0.5" style={{ letterSpacing: 1 }}>
        {label}
      </Text>
    </View>
  );
}
