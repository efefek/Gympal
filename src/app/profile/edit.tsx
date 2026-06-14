import { useState } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, { FadeInRight, FadeIn, LinearTransition } from 'react-native-reanimated';
import { X, ChevronLeft } from 'lucide-react-native';

import { HorizontalRuler } from '@/components/ui/HorizontalRuler';
import { RevealText } from '@/components/ui/RevealText';
import {
  getProfile,
  saveProfile,
  calcBMI,
  bmiCategory,
  goalLabels,
  experienceLabels,
  equipmentLabels,
  gymStyleLabels,
  dietLabels,
  type UserProfile,
  type Goal,
  type Experience,
  type EquipmentType,
  type WorkoutLocation,
  type GymStyle,
} from '@/lib/profile';
import { getExercises } from '@/lib/musclewiki';
import { generateProgram } from '@/lib/workout';
import { saveProgram } from '@/lib/program-store';
import { Fonts } from '@/lib/tokens';
import { useTheme } from '@/lib/theme-context';

const STEPS = ['Body', 'Goal', 'Setup', 'Diet', 'Summary'] as const;

const GOALS = Object.keys(goalLabels) as Goal[];
const EXPERIENCES = Object.keys(experienceLabels) as Experience[];
const EQUIPMENTS = Object.keys(equipmentLabels) as EquipmentType[];
const GYM_STYLES = Object.keys(gymStyleLabels) as GymStyle[];
const DIETS = Object.keys(dietLabels);

function initialProfile(): UserProfile {
  const existing = getProfile();
  if (existing) return existing;
  return {
    height: 175,
    weight: 75,
    goal: 'general_fitness',
    experience: 'beginner',
    equipment: ['bodyweight'],
    location: 'home',
    dietaryPreferences: 'none',
    foodDislikes: '',
    allergens: '',
    dailyWaterMlTarget: 2500,
    dailyProteinGTarget: 150,
    gymStyle: 'bodybuilding',
    dislikedEquipment: [],
  };
}

export default function ProfileEditScreen() {
  const { theme } = useTheme();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [p, setP] = useState<UserProfile>(initialProfile);

  const patch = (next: Partial<UserProfile>) => setP((prev) => ({ ...prev, ...next }));

  const back = () => (step === 0 ? router.back() : setStep((s) => s - 1));
  const next = () => (step < STEPS.length - 1 ? setStep((s) => s + 1) : finish());

  async function finish() {
    setSaving(true);
    try {
      // Gym modunda: tüm ekipman var sayılır, istenmeyenler çıkarılır
      const equipment =
        p.location === 'gym'
          ? EQUIPMENTS.filter((e) => !(p.dislikedEquipment ?? []).includes(e))
          : p.equipment;
      const profile: UserProfile = { ...p, equipment };
      saveProfile(profile);
      const { exercises } = await getExercises({ limit: 500 });
      const program = generateProgram(profile, exercises);
      saveProgram(program);
      router.replace('/(tabs)');
    } catch {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top', 'bottom']}>
      {/* Üst bar */}
      <View className="flex-row items-center gap-3 px-6 pt-2">
        <Pressable onPress={back} hitSlop={8} className="size-9 items-center justify-center rounded-full" style={{ backgroundColor: theme.surface2 }}>
          <ChevronLeft size={18} color={theme.fg} />
        </Pressable>
        <View className="flex-1 flex-row gap-1.5">
          {STEPS.map((_, i) => (
            <View key={i} className="flex-1 rounded-full" style={{ height: 4, backgroundColor: i <= step ? theme.accent : theme.surface2 }} />
          ))}
        </View>
        <Pressable onPress={() => router.back()} hitSlop={8} className="size-9 items-center justify-center rounded-full" style={{ backgroundColor: theme.surface2 }}>
          <X size={18} color={theme.fg} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 24 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Animated.View key={step} entering={FadeInRight.duration(300)}>
          {step === 0 && <BodyStep p={p} patch={patch} />}
          {step === 1 && <GoalStep p={p} patch={patch} />}
          {step === 2 && <SetupStep p={p} patch={patch} />}
          {step === 3 && <DietStep p={p} patch={patch} />}
          {step === 4 && <SummaryStep p={p} />}
        </Animated.View>
      </ScrollView>

      {/* Alt aksiyon — invert (ink) + köşeli */}
      <View className="px-6 pb-2">
        <Pressable
          onPress={next}
          disabled={saving}
          style={({ pressed }) => ({
            backgroundColor: theme.ink,
            borderRadius: 18,
            paddingVertical: 17,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: saving ? 0.6 : pressed ? 0.85 : 1,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          })}
        >
          {saving ? (
            <ActivityIndicator color={theme.inkText} />
          ) : (
            <Text className="font-bold text-base" style={{ color: theme.inkText }}>
              {step === STEPS.length - 1 ? 'Create program' : 'Next'}
            </Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

/* ─── Adım 1 — Body ───────────────────────────────────────── */

function BodyStep({ p, patch }: { p: UserProfile; patch: (n: Partial<UserProfile>) => void }) {
  const { theme } = useTheme();
  const bmi = calcBMI(p.height, p.weight);
  const cat = bmiCategory(bmi);
  const bmiPos = Math.min(1, Math.max(0, (bmi - 15) / 20));

  return (
    <View>
      <StepHeading kicker="Step 1" title={'Your\nbody'} />

      <Text className="font-mono text-[10px] uppercase text-muted mt-8 mb-2 text-center" style={{ letterSpacing: 2 }}>Height</Text>
      <HorizontalRuler value={p.height} min={120} max={220} unit="cm" onChange={(v) => patch({ height: v })} />

      <Text className="font-mono text-[10px] uppercase text-muted mt-8 mb-2 text-center" style={{ letterSpacing: 2 }}>Weight</Text>
      <HorizontalRuler value={p.weight} min={30} max={200} unit="kg" onChange={(v) => patch({ weight: v })} />

      <View className="mt-10 rounded-3xl p-5" style={{ backgroundColor: theme.surface1, borderWidth: 1.5, borderColor: theme.border }}>
        <View className="flex-row items-baseline justify-between mb-3">
          <Text className="font-mono text-[10px] uppercase text-muted" style={{ letterSpacing: 2 }}>BMI</Text>
          <Text className="font-display text-2xl" style={{ color: theme.fg }}>
            {bmi.toFixed(1)} <Text className="font-mono text-xs" style={{ color: theme.accent }}>{cat}</Text>
          </Text>
        </View>
        <View style={{ height: 8, borderRadius: 4, backgroundColor: theme.surface3 }}>
          <Animated.View layout={LinearTransition.springify()} style={{ position: 'absolute', left: `${bmiPos * 100}%`, marginLeft: -6, top: -2, width: 12, height: 12, borderRadius: 6, backgroundColor: theme.accent }} />
        </View>
        <View className="flex-row justify-between mt-2">
          {['Under', 'Normal', 'Over', 'Obese'].map((l) => (
            <Text key={l} className="font-mono text-[8px] uppercase text-muted" style={{ letterSpacing: 0.5 }}>{l}</Text>
          ))}
        </View>
      </View>
    </View>
  );
}

/* ─── Adım 2 — Goal ───────────────────────────────────────── */

function GoalStep({ p, patch }: { p: UserProfile; patch: (n: Partial<UserProfile>) => void }) {
  return (
    <View>
      <StepHeading kicker="Step 2" title={'Your\ngoal'} />
      <SectionLabel>What do you want?</SectionLabel>
      <View className="flex-row flex-wrap gap-2">
        {GOALS.map((g) => (
          <Chip key={g} label={goalLabels[g]} active={p.goal === g} onPress={() => patch({ goal: g })} />
        ))}
      </View>
      <SectionLabel>Experience</SectionLabel>
      <View className="flex-row flex-wrap gap-2">
        {EXPERIENCES.map((e) => (
          <Chip key={e} label={experienceLabels[e]} active={p.experience === e} onPress={() => patch({ experience: e })} />
        ))}
      </View>
    </View>
  );
}

/* ─── Adım 3 — Setup ──────────────────────────────────────── */

function SetupStep({ p, patch }: { p: UserProfile; patch: (n: Partial<UserProfile>) => void }) {
  const toggleEquip = (eq: EquipmentType) => {
    const has = p.equipment.includes(eq);
    patch({ equipment: has ? p.equipment.filter((x) => x !== eq) : [...p.equipment, eq] });
  };
  const toggleDisliked = (eq: EquipmentType) => {
    const list = p.dislikedEquipment ?? [];
    const has = list.includes(eq);
    patch({ dislikedEquipment: has ? list.filter((x) => x !== eq) : [...list, eq] });
  };

  return (
    <View>
      <StepHeading kicker="Step 3" title={'Your\nsetup'} />
      <SectionLabel>Where do you train?</SectionLabel>
      <View className="flex-row gap-2">
        {(['home', 'gym'] as WorkoutLocation[]).map((loc) => (
          <Chip key={loc} label={loc === 'home' ? 'Home' : 'Gym'} active={p.location === loc} onPress={() => patch({ location: loc })} grow />
        ))}
      </View>

      {/* Konuma göre içerik — yumuşak slide geçiş */}
      <Animated.View key={p.location} entering={FadeInRight.duration(280)} layout={LinearTransition.springify()}>
        {p.location === 'home' ? (
          <>
            <SectionLabel>Available equipment</SectionLabel>
            <View className="flex-row flex-wrap gap-2">
              {EQUIPMENTS.map((eq) => (
                <Chip key={eq} label={equipmentLabels[eq]} active={p.equipment.includes(eq)} onPress={() => toggleEquip(eq)} />
              ))}
            </View>
          </>
        ) : (
          <>
            <SectionLabel>Training style</SectionLabel>
            <View className="flex-row flex-wrap gap-2">
              {GYM_STYLES.map((s) => (
                <Chip key={s} label={gymStyleLabels[s]} active={p.gymStyle === s} onPress={() => patch({ gymStyle: s })} />
              ))}
            </View>
            <SectionLabel>Avoid these (optional)</SectionLabel>
            <View className="flex-row flex-wrap gap-2">
              {EQUIPMENTS.filter((e) => e !== 'bodyweight').map((eq) => (
                <Chip key={eq} label={equipmentLabels[eq]} active={(p.dislikedEquipment ?? []).includes(eq)} onPress={() => toggleDisliked(eq)} danger />
              ))}
            </View>
          </>
        )}
      </Animated.View>

      <SectionLabel>Daily targets</SectionLabel>
      <Text className="font-mono text-[10px] uppercase text-muted mb-2 text-center" style={{ letterSpacing: 2 }}>Water</Text>
      <HorizontalRuler value={p.dailyWaterMlTarget ?? 2500} min={1000} max={5000} step={100} unit="ml" onChange={(v) => patch({ dailyWaterMlTarget: v })} />
      <View className="h-6" />
      <Text className="font-mono text-[10px] uppercase text-muted mb-2 text-center" style={{ letterSpacing: 2 }}>Protein</Text>
      <HorizontalRuler value={p.dailyProteinGTarget ?? 150} min={40} max={300} step={5} unit="g" onChange={(v) => patch({ dailyProteinGTarget: v })} />
    </View>
  );
}

/* ─── Adım 4 — Diet ───────────────────────────────────────── */

function DietStep({ p, patch }: { p: UserProfile; patch: (n: Partial<UserProfile>) => void }) {
  const { theme } = useTheme();
  return (
    <View>
      <StepHeading kicker="Step 4" title={'Your\ndiet'} />
      <SectionLabel>Diet preference</SectionLabel>
      <View className="flex-row flex-wrap gap-2">
        {DIETS.map((d) => (
          <Chip key={d} label={dietLabels[d]} active={p.dietaryPreferences === d} onPress={() => patch({ dietaryPreferences: d })} />
        ))}
      </View>

      <SectionLabel>Foods you dislike</SectionLabel>
      <TextInput
        value={p.foodDislikes}
        onChangeText={(t) => patch({ foodDislikes: t })}
        placeholder="e.g. broccoli, liver…"
        placeholderTextColor={theme.muted}
        className="rounded-2xl px-4 py-3 text-base"
        style={{ backgroundColor: theme.surface1, borderWidth: 1.5, borderColor: theme.border, color: theme.fg, fontFamily: Fonts.sans }}
      />

      <SectionLabel>Allergens</SectionLabel>
      <TextInput
        value={p.allergens}
        onChangeText={(t) => patch({ allergens: t })}
        placeholder="e.g. peanuts, lactose…"
        placeholderTextColor={theme.muted}
        className="rounded-2xl px-4 py-3 text-base"
        style={{ backgroundColor: theme.surface1, borderWidth: 1.5, borderColor: theme.border, color: theme.fg, fontFamily: Fonts.sans }}
      />
    </View>
  );
}

/* ─── Adım 5 — Summary ────────────────────────────────────── */

function SummaryStep({ p }: { p: UserProfile }) {
  const { theme } = useTheme();
  const bmi = calcBMI(p.height, p.weight);
  const days = p.experience === 'beginner' ? 3 : p.experience === 'intermediate' ? 4 : 5;
  const rows: Array<[string, string]> = [
    ['Height', `${p.height} cm`],
    ['Weight', `${p.weight} kg`],
    ['BMI', `${bmi.toFixed(1)} (${bmiCategory(bmi)})`],
    ['Goal', goalLabels[p.goal]],
    ['Experience', experienceLabels[p.experience]],
    ['Location', p.location === 'home' ? 'Home' : `Gym · ${gymStyleLabels[p.gymStyle ?? 'bodybuilding']}`],
    p.location === 'home' ? ['Equipment', `${p.equipment.length} selected`] : ['Avoid', `${(p.dislikedEquipment ?? []).length} excluded`],
    ['Diet', dietLabels[p.dietaryPreferences ?? 'none'] ?? '—'],
    ['Water', `${p.dailyWaterMlTarget} ml/day`],
    ['Protein', `${p.dailyProteinGTarget} g/day`],
  ];

  return (
    <View>
      <StepHeading kicker="Step 5" title={'Ready'} />
      <View className="mt-8 rounded-3xl overflow-hidden" style={{ backgroundColor: theme.surface1, borderWidth: 1.5, borderColor: theme.border }}>
        {rows.map(([k, v], i) => (
          <View key={k} className="flex-row items-center justify-between px-5 py-3.5" style={{ borderTopWidth: i === 0 ? 0 : 1, borderTopColor: theme.border }}>
            <Text className="font-mono text-[11px] uppercase text-muted" style={{ letterSpacing: 1 }}>{k}</Text>
            <Text className="font-bold text-sm" style={{ color: theme.fg }}>{v}</Text>
          </View>
        ))}
      </View>
      <Text className="font-mono text-[10px] text-muted mt-4 text-center" style={{ letterSpacing: 1 }}>
        We'll generate a {days}-day program
      </Text>
    </View>
  );
}

/* ─── Ortak parçalar ──────────────────────────────────────── */

function StepHeading({ kicker, title }: { kicker: string; title: string }) {
  const { theme } = useTheme();
  return (
    <View>
      <Text className="font-mono text-[11px] uppercase text-muted mb-2" style={{ letterSpacing: 3 }}>{kicker}</Text>
      <RevealText text={title} style={{ fontFamily: Fonts.display, color: theme.fg, fontSize: 48, lineHeight: 46, letterSpacing: -2 }} />
    </View>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <Text className="font-mono text-[10px] uppercase text-muted mt-8 mb-3" style={{ letterSpacing: 2 }}>
      {children}
    </Text>
  );
}

function Chip({ label, active, onPress, grow, danger }: { label: string; active: boolean; onPress: () => void; grow?: boolean; danger?: boolean }) {
  const { theme } = useTheme();
  const activeBg = danger ? theme.fg : theme.accent;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexGrow: grow ? 1 : 0,
        alignItems: 'center',
        borderRadius: 999,
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: active ? activeBg : theme.surface1,
        borderWidth: 1.5,
        borderColor: active ? activeBg : theme.border,
        transform: [{ scale: pressed ? 0.96 : 1 }],
      })}
    >
      <Text className="font-bold text-sm" style={{ color: active ? theme.inkText : theme.fg }}>
        {label}
      </Text>
    </Pressable>
  );
}
