import { useState } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { X, ChevronLeft, Minus, Plus } from 'lucide-react-native';

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
  type UserProfile,
  type Goal,
  type Experience,
  type EquipmentType,
  type WorkoutLocation,
} from '@/lib/profile';
import { getExercises } from '@/lib/musclewiki';
import { generateProgram } from '@/lib/workout';
import { saveProgram } from '@/lib/program-store';
import { Fonts } from '@/lib/tokens';
import { useTheme } from '@/lib/theme-context';

const STEPS = ['Body', 'Goal', 'Setup', 'Summary'] as const;

const GOALS = Object.keys(goalLabels) as Goal[];
const EXPERIENCES = Object.keys(experienceLabels) as Experience[];
const EQUIPMENTS = Object.keys(equipmentLabels) as EquipmentType[];

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
    dietaryPreferences: '',
    foodDislikes: '',
    allergens: '',
    dailyWaterMlTarget: 2500,
    dailyProteinGTarget: 150,
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
      saveProfile(p);
      const { exercises } = await getExercises({ limit: 500 });
      const program = generateProgram(p, exercises);
      saveProgram(program);
      router.replace('/(tabs)');
    } catch {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top', 'bottom']}>
      {/* Üst bar: geri + progress + kapat */}
      <View className="flex-row items-center gap-3 px-6 pt-2">
        <Pressable onPress={back} hitSlop={8} className="size-9 items-center justify-center rounded-full" style={{ backgroundColor: theme.surface2 }}>
          <ChevronLeft size={18} color={theme.fg} />
        </Pressable>
        <View className="flex-1 flex-row gap-1.5">
          {STEPS.map((_, i) => (
            <View
              key={i}
              className="flex-1 rounded-full"
              style={{ height: 4, backgroundColor: i <= step ? theme.accent : theme.surface2 }}
            />
          ))}
        </View>
        <Pressable onPress={() => router.back()} hitSlop={8} className="size-9 items-center justify-center rounded-full" style={{ backgroundColor: theme.surface2 }}>
          <X size={18} color={theme.fg} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        {step === 0 && <BodyStep p={p} patch={patch} />}
        {step === 1 && <GoalStep p={p} patch={patch} />}
        {step === 2 && <SetupStep p={p} patch={patch} />}
        {step === 3 && <SummaryStep p={p} />}
      </ScrollView>

      {/* Alt aksiyon */}
      <View className="px-6 pb-2">
        <Pressable
          onPress={next}
          disabled={saving}
          className="items-center justify-center rounded-full py-4"
          style={{ backgroundColor: theme.accent, opacity: saving ? 0.6 : 1 }}
        >
          {saving ? (
            <ActivityIndicator color="#0a0a0b" />
          ) : (
            <Text className="font-bold text-base" style={{ color: '#0a0a0b' }}>
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
  // BMI 15..35 → 0..1
  const bmiPos = Math.min(1, Math.max(0, (bmi - 15) / 20));

  return (
    <View>
      <StepHeading kicker="Step 1" title={'Your\nbody'} />

      <Text className="font-mono text-[10px] uppercase text-muted mt-8 mb-2 text-center" style={{ letterSpacing: 2 }}>
        Height
      </Text>
      <HorizontalRuler value={p.height} min={120} max={220} unit="cm" onChange={(v) => patch({ height: v })} />

      <Text className="font-mono text-[10px] uppercase text-muted mt-8 mb-2 text-center" style={{ letterSpacing: 2 }}>
        Weight
      </Text>
      <HorizontalRuler value={p.weight} min={30} max={200} unit="kg" onChange={(v) => patch({ weight: v })} />

      {/* BMI bar */}
      <View className="mt-10 rounded-3xl p-5" style={{ backgroundColor: theme.surface1, borderWidth: 1.5, borderColor: theme.border }}>
        <View className="flex-row items-baseline justify-between mb-3">
          <Text className="font-mono text-[10px] uppercase text-muted" style={{ letterSpacing: 2 }}>
            BMI
          </Text>
          <Text className="font-display text-2xl" style={{ color: theme.fg }}>
            {bmi.toFixed(1)} <Text className="font-mono text-xs" style={{ color: theme.accent }}>{cat}</Text>
          </Text>
        </View>
        <View style={{ height: 8, borderRadius: 4, backgroundColor: theme.surface3, overflow: 'hidden' }}>
          <View style={{ position: 'absolute', left: `${bmiPos * 100}%`, marginLeft: -6, top: -2, width: 12, height: 12, borderRadius: 6, backgroundColor: theme.accent }} />
        </View>
        <View className="flex-row justify-between mt-2">
          {['Under', 'Normal', 'Over', 'Obese'].map((l) => (
            <Text key={l} className="font-mono text-[8px] uppercase text-muted" style={{ letterSpacing: 0.5 }}>
              {l}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
}

/* ─── Adım 2 — Goal & Experience ──────────────────────────── */

function GoalStep({ p, patch }: { p: UserProfile; patch: (n: Partial<UserProfile>) => void }) {
  return (
    <View>
      <StepHeading kicker="Step 2" title={'Your\ngoal'} />

      <Text className="font-mono text-[10px] uppercase text-muted mt-8 mb-3" style={{ letterSpacing: 2 }}>
        What do you want?
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {GOALS.map((g) => (
          <Chip key={g} label={goalLabels[g]} active={p.goal === g} onPress={() => patch({ goal: g })} />
        ))}
      </View>

      <Text className="font-mono text-[10px] uppercase text-muted mt-8 mb-3" style={{ letterSpacing: 2 }}>
        Experience
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {EXPERIENCES.map((e) => (
          <Chip key={e} label={experienceLabels[e]} active={p.experience === e} onPress={() => patch({ experience: e })} />
        ))}
      </View>
    </View>
  );
}

/* ─── Adım 3 — Setup (location, equipment, targets) ───────── */

function SetupStep({ p, patch }: { p: UserProfile; patch: (n: Partial<UserProfile>) => void }) {
  const { theme } = useTheme();
  const toggleEquip = (eq: EquipmentType) => {
    const has = p.equipment.includes(eq);
    patch({ equipment: has ? p.equipment.filter((x) => x !== eq) : [...p.equipment, eq] });
  };

  return (
    <View>
      <StepHeading kicker="Step 3" title={'Your\nsetup'} />

      <Text className="font-mono text-[10px] uppercase text-muted mt-8 mb-3" style={{ letterSpacing: 2 }}>
        Where do you train?
      </Text>
      <View className="flex-row gap-2">
        {(['home', 'gym'] as WorkoutLocation[]).map((loc) => (
          <Chip key={loc} label={loc === 'home' ? 'Home' : 'Gym'} active={p.location === loc} onPress={() => patch({ location: loc })} grow />
        ))}
      </View>

      {p.location === 'home' && (
        <>
          <Text className="font-mono text-[10px] uppercase text-muted mt-8 mb-3" style={{ letterSpacing: 2 }}>
            Available equipment
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {EQUIPMENTS.map((eq) => (
              <Chip key={eq} label={equipmentLabels[eq]} active={p.equipment.includes(eq)} onPress={() => toggleEquip(eq)} />
            ))}
          </View>
        </>
      )}

      <Text className="font-mono text-[10px] uppercase text-muted mt-8 mb-3" style={{ letterSpacing: 2 }}>
        Daily targets
      </Text>
      <Stepper label="Water" value={p.dailyWaterMlTarget ?? 2500} unit="ml" step={250} min={1000} max={5000} onChange={(v) => patch({ dailyWaterMlTarget: v })} />
      <View className="h-3" />
      <Stepper label="Protein" value={p.dailyProteinGTarget ?? 150} unit="g" step={10} min={50} max={300} onChange={(v) => patch({ dailyProteinGTarget: v })} />
    </View>
  );
}

/* ─── Adım 4 — Summary ────────────────────────────────────── */

function SummaryStep({ p }: { p: UserProfile }) {
  const { theme } = useTheme();
  const bmi = calcBMI(p.height, p.weight);
  const rows: Array<[string, string]> = [
    ['Height', `${p.height} cm`],
    ['Weight', `${p.weight} kg`],
    ['BMI', `${bmi.toFixed(1)} (${bmiCategory(bmi)})`],
    ['Goal', goalLabels[p.goal]],
    ['Experience', experienceLabels[p.experience]],
    ['Location', p.location === 'home' ? 'Home' : 'Gym'],
    ['Equipment', `${p.equipment.length} selected`],
    ['Water', `${p.dailyWaterMlTarget} ml/day`],
    ['Protein', `${p.dailyProteinGTarget} g/day`],
  ];

  return (
    <View>
      <StepHeading kicker="Step 4" title={'Ready'} />
      <View className="mt-8 rounded-3xl overflow-hidden" style={{ backgroundColor: theme.surface1, borderWidth: 1.5, borderColor: theme.border }}>
        {rows.map(([k, v], i) => (
          <View
            key={k}
            className="flex-row items-center justify-between px-5 py-3.5"
            style={{ borderTopWidth: i === 0 ? 0 : 1, borderTopColor: theme.border }}
          >
            <Text className="font-mono text-[11px] uppercase text-muted" style={{ letterSpacing: 1 }}>
              {k}
            </Text>
            <Text className="font-bold text-sm" style={{ color: theme.fg }}>
              {v}
            </Text>
          </View>
        ))}
      </View>
      <Text className="font-mono text-[10px] text-muted mt-4 text-center" style={{ letterSpacing: 1 }}>
        We'll generate a {p.experience === 'beginner' ? 3 : p.experience === 'intermediate' ? 4 : 5}-day program
      </Text>
    </View>
  );
}

/* ─── Ortak parçalar ──────────────────────────────────────── */

function StepHeading({ kicker, title }: { kicker: string; title: string }) {
  const { theme } = useTheme();
  return (
    <View>
      <Text className="font-mono text-[11px] uppercase text-muted mb-2" style={{ letterSpacing: 3 }}>
        {kicker}
      </Text>
      <RevealText text={title} style={{ fontFamily: Fonts.display, color: theme.fg, fontSize: 48, lineHeight: 46, letterSpacing: -2 }} />
    </View>
  );
}

function Chip({ label, active, onPress, grow }: { label: string; active: boolean; onPress: () => void; grow?: boolean }) {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      className="rounded-full px-4 py-2.5"
      style={{
        flexGrow: grow ? 1 : 0,
        alignItems: 'center',
        backgroundColor: active ? theme.accent : theme.surface1,
        borderWidth: 1.5,
        borderColor: active ? theme.accent : theme.border,
      }}
    >
      <Text className="font-bold text-sm" style={{ color: active ? '#0a0a0b' : theme.fg }}>
        {label}
      </Text>
    </Pressable>
  );
}

function Stepper({
  label,
  value,
  unit,
  step,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  unit: string;
  step: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  const { theme } = useTheme();
  return (
    <View
      className="flex-row items-center justify-between rounded-2xl px-4 py-3"
      style={{ backgroundColor: theme.surface1, borderWidth: 1.5, borderColor: theme.border }}
    >
      <Text className="font-bold text-sm" style={{ color: theme.fg }}>
        {label}
      </Text>
      <View className="flex-row items-center gap-4">
        <Pressable onPress={() => onChange(Math.max(min, value - step))} hitSlop={8} className="size-8 items-center justify-center rounded-full" style={{ backgroundColor: theme.surface3 }}>
          <Minus size={16} color={theme.fg} />
        </Pressable>
        <Text className="font-display text-lg" style={{ color: theme.fg, minWidth: 80, textAlign: 'center' }}>
          {value}
          <Text className="font-mono text-xs text-muted"> {unit}</Text>
        </Text>
        <Pressable onPress={() => onChange(Math.min(max, value + step))} hitSlop={8} className="size-8 items-center justify-center rounded-full" style={{ backgroundColor: theme.accent }}>
          <Plus size={16} color="#0a0a0b" />
        </Pressable>
      </View>
    </View>
  );
}
