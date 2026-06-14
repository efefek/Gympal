'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Activity,
  Armchair,
  ArrowLeft,
  ArrowRight,
  Building2,
  Cable,
  Check,
  Dumbbell,
  RotateCcw,
  StretchHorizontal,
  User,
  Utensils,
  type LucideIcon,
} from 'lucide-react'
import {
  clearProfile,
  equipmentLabels,
  experienceLabels,
  getProfile,
  goalLabels,
  saveProfile,
  type EquipmentType,
  type Experience,
  type Goal,
  type UserProfile,
  type WorkoutLocation,
} from '@/lib/profile'

const equipmentOptions: EquipmentType[] = [
  'bodyweight', 'dumbbell', 'barbell', 'kettlebell',
  'resistance_band', 'cable', 'machine', 'chair',
  'yoga_mat', 'ez_bar', 'lever', 'sled', 'smith', 'other',
]

const equipmentIcon: Record<EquipmentType, LucideIcon> = {
  bodyweight: User,
  dumbbell: Dumbbell,
  barbell: Dumbbell,
  kettlebell: Activity,
  resistance_band: StretchHorizontal,
  cable: Cable,
  machine: Building2,
  chair: Armchair,
  yoga_mat: StretchHorizontal,
  ez_bar: Dumbbell,
  lever: Activity,
  sled: Activity,
  smith: Building2,
  other: Dumbbell,
}

type Step = 'basics' | 'diet' | 'equipment' | 'summary'

const steps: Step[] = ['basics', 'diet', 'equipment', 'summary']

const DEFAULT_FORM: UserProfile = {
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
}

const stepCopy: Record<Step, { title: string; body: string }> = {
  basics: { title: 'Profile basics', body: 'Body metrics and training level.' },
  diet: { title: 'Diet targets', body: 'Nutrition preferences for daily tracking.' },
  equipment: { title: 'Training setup', body: 'Location and available equipment.' },
  summary: { title: 'Review profile', body: 'Save the details used by GymPal.' },
}

export default function ProfileEditPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('basics')
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState<UserProfile>(DEFAULT_FORM)

  useEffect(() => {
    const existing = getProfile()
    if (existing) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only localStorage prefill
      setForm({ ...DEFAULT_FORM, ...existing })
    }
  }, [])

  function update<T extends keyof UserProfile>(field: T, value: UserProfile[T]) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function go(delta: number) {
    const nextIndex = Math.max(0, Math.min(steps.length - 1, steps.indexOf(step) + delta))
    setStep(steps[nextIndex])
  }

  function handleSave() {
    saveProfile(form)
    setSaved(true)
    window.setTimeout(() => router.push('/profile'), 700)
  }

  function handleReset() {
    clearProfile()
    setForm(DEFAULT_FORM)
    setStep('basics')
    setSaved(false)
  }

  function toggleEquipment(eq: EquipmentType) {
    setForm((prev) => ({
      ...prev,
      equipment: prev.equipment.includes(eq)
        ? prev.equipment.filter((entry) => entry !== eq)
        : [...prev.equipment, eq],
    }))
  }

  if (saved) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-5 text-center">
        <div className="btn-ink mb-6 flex size-16 items-center justify-center">
          <Check className="size-8" aria-hidden="true" />
        </div>
        <div role="status" aria-live="polite">
          <h1 className="font-mono text-2xl font-bold">Profile Saved</h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>Opening your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-5 py-12 pb-32 md:max-w-2xl">
      <header className="mb-8">
        <div className="mb-4 flex items-center gap-3">
          <div className="btn-ink flex size-10 items-center justify-center">
            <Dumbbell className="size-5" aria-hidden="true" />
          </div>
          <div>
            <h1 className="font-mono text-2xl font-bold leading-none tracking-normal">{stepCopy[step].title}</h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>{stepCopy[step].body}</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {steps.map((item, index) => (
            <button
              key={item}
              type="button"
              onClick={() => setStep(item)}
              aria-current={step === item ? 'step' : undefined}
              className="h-2"
              style={{ background: index <= steps.indexOf(step) ? 'var(--ink)' : 'var(--surface-3)' }}
            >
              <span className="sr-only">{stepCopy[item].title}</span>
            </button>
          ))}
        </div>
      </header>

      {step === 'basics' && (
        <section className="border-[3px] p-5 pb-24" style={{ background: 'var(--surface-1)', borderColor: 'var(--foreground)' }}>
          <div className="grid grid-cols-2 gap-4">
            <NumberField
              id="profile-height"
              label="Height"
              suffix="cm"
              value={form.height}
              min={100}
              max={250}
              onChange={(value) => update('height', value)}
            />
            <NumberField
              id="profile-weight"
              label="Weight"
              suffix="kg"
              value={form.weight}
              min={30}
              max={300}
              onChange={(value) => update('weight', value)}
            />
          </div>

          <ChoiceGroup
            label="Goal"
            values={Object.entries(goalLabels) as [Goal, string][]}
            current={form.goal}
            onSelect={(value) => update('goal', value)}
          />

          <ChoiceGroup
            label="Experience level"
            values={Object.entries(experienceLabels) as [Experience, string][]}
            current={form.experience}
            onSelect={(value) => update('experience', value)}
          />
        </section>
      )}

      {step === 'diet' && (
        <section className="border-[3px] p-5 pb-24" style={{ background: 'var(--surface-1)', borderColor: 'var(--foreground)' }}>
          <div className="mb-4 flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.18em]">
            <Utensils className="size-4" aria-hidden="true" />
            Nutrition
          </div>
          <TextAreaField
            id="dietary-preferences"
            label="Dietary preferences"
            value={form.dietaryPreferences ?? ''}
            placeholder="High protein, vegetarian, halal..."
            onChange={(value) => update('dietaryPreferences', value)}
          />
          <TextAreaField
            id="food-dislikes"
            label="Dislikes"
            value={form.foodDislikes ?? ''}
            placeholder="Foods you avoid by preference"
            onChange={(value) => update('foodDislikes', value)}
          />
          <TextAreaField
            id="allergens"
            label="Allergens"
            value={form.allergens ?? ''}
            placeholder="Nuts, lactose, gluten..."
            onChange={(value) => update('allergens', value)}
          />
          <div className="grid grid-cols-2 gap-4">
            <NumberField
              id="daily-water"
              label="Daily water"
              suffix="ml"
              value={form.dailyWaterMlTarget ?? 2500}
              min={500}
              max={6000}
              onChange={(value) => update('dailyWaterMlTarget', value)}
            />
            <NumberField
              id="daily-protein"
              label="Daily protein"
              suffix="g"
              value={form.dailyProteinGTarget ?? 150}
              min={20}
              max={350}
              onChange={(value) => update('dailyProteinGTarget', value)}
            />
          </div>
        </section>
      )}

      {step === 'equipment' && (
        <section className="border-[3px] p-5 pb-24" style={{ background: 'var(--surface-1)', borderColor: 'var(--foreground)' }}>
          <ChoiceGroup
            label="Workout location"
            values={[
              ['home', 'Home'],
              ['gym', 'Gym'],
            ] as [WorkoutLocation, string][]}
            current={form.location}
            onSelect={(value) => update('location', value)}
          />

          {form.location === 'home' ? (
            <fieldset className="mt-5 border-0 p-0">
              <legend className="mb-2 font-mono text-xs font-bold uppercase tracking-[0.18em]" style={{ color: 'var(--muted)' }}>
                Available equipment
              </legend>
              <div className="grid grid-cols-2 gap-2">
                {equipmentOptions.map((eq) => {
                  const Icon = equipmentIcon[eq]
                  const active = form.equipment.includes(eq)
                  return (
                    <button
                      key={eq}
                      type="button"
                      aria-pressed={active}
                      onClick={() => toggleEquipment(eq)}
                      className="flex min-h-12 items-center gap-2 border px-3 py-2 text-left text-sm font-semibold"
                      style={{
                        background: active ? 'var(--ink)' : 'var(--surface-2)',
                        borderColor: active ? 'var(--ink)' : 'var(--card-border)',
                        color: active ? 'var(--ink-text)' : 'var(--foreground)',
                      }}
                    >
                      <Icon className="size-4 shrink-0" aria-hidden="true" />
                      <span className="min-w-0 flex-1">{equipmentLabels[eq]}</span>
                      {active && <Check className="size-3.5 shrink-0" aria-hidden="true" />}
                    </button>
                  )
                })}
              </div>
            </fieldset>
          ) : (
            <div className="mt-5 border-2 p-4 text-sm" style={{ borderColor: 'var(--foreground)' }}>
              Full gym access is assumed. Program generation can use machines, cables, free weights, and bodyweight work.
            </div>
          )}
        </section>
      )}

      {step === 'summary' && (
        <section className="border-[3px] p-5 pb-24" style={{ background: 'var(--surface-1)', borderColor: 'var(--foreground)' }}>
          <SummaryRow label="Height" value={`${form.height} cm`} />
          <SummaryRow label="Weight" value={`${form.weight} kg`} />
          <SummaryRow label="Goal" value={goalLabels[form.goal]} />
          <SummaryRow label="Experience" value={experienceLabels[form.experience]} />
          <SummaryRow label="Location" value={form.location === 'gym' ? 'Gym' : 'Home'} />
          <SummaryRow label="Water target" value={`${form.dailyWaterMlTarget ?? 2500} ml`} />
          <SummaryRow label="Protein target" value={`${form.dailyProteinGTarget ?? 150} g`} />
          <SummaryRow label="Diet" value={form.dietaryPreferences?.trim() || 'Not set'} />
          <SummaryRow label="Dislikes" value={form.foodDislikes?.trim() || 'Not set'} />
          <SummaryRow label="Allergens" value={form.allergens?.trim() || 'Not set'} />
        </section>
      )}

      <footer
        className="sticky bottom-20 z-30 mt-6 flex gap-3 py-3"
        style={{ background: 'var(--background)' }}
      >
        {step !== 'basics' && (
          <button
            type="button"
            onClick={() => go(-1)}
            className="flex items-center justify-center gap-2 border-2 px-5 py-3 text-sm font-bold"
            style={{ borderColor: 'var(--foreground)', color: 'var(--foreground)' }}
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back
          </button>
        )}
        {step !== 'summary' ? (
          <button
            type="button"
            onClick={() => go(1)}
            className="btn-ink flex flex-1 items-center justify-center gap-2 px-5 py-3 text-sm font-bold"
          >
            Next
            <ArrowRight className="size-4" aria-hidden="true" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSave}
            className="btn-ink flex flex-1 items-center justify-center gap-2 px-5 py-3 text-sm font-bold"
          >
            <Check className="size-4" aria-hidden="true" />
            Save Profile
          </button>
        )}
      </footer>

      <button
        type="button"
        onClick={handleReset}
        className="mt-4 flex items-center justify-center gap-2 py-2 text-xs font-semibold"
        style={{ color: 'var(--muted)' }}
      >
        <RotateCcw className="size-3.5" aria-hidden="true" />
        Reset profile
      </button>
    </div>
  )
}

function NumberField({
  id,
  label,
  suffix,
  value,
  min,
  max,
  onChange,
}: {
  id: string
  label: string
  suffix: string
  value: number
  min: number
  max: number
  onChange: (value: number) => void
}) {
  return (
    <div className="mb-5">
      <label htmlFor={id} className="mb-1.5 block font-mono text-xs font-bold uppercase tracking-[0.18em]" style={{ color: 'var(--muted)' }}>
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min={min}
          max={max}
          value={value}
          onChange={(event) => {
            const next = Number(event.target.value)
            if (Number.isFinite(next)) onChange(Math.max(min, Math.min(max, next)))
          }}
          className="w-full border px-3 py-2.5 font-mono text-sm tabular-nums outline-none"
          style={{
            background: 'var(--surface-2)',
            borderColor: 'var(--card-border)',
            color: 'var(--foreground)',
          }}
        />
        <span className="w-8 text-xs font-semibold" style={{ color: 'var(--muted)' }}>{suffix}</span>
      </div>
    </div>
  )
}

function TextAreaField({
  id,
  label,
  value,
  placeholder,
  onChange,
}: {
  id: string
  label: string
  value: string
  placeholder: string
  onChange: (value: string) => void
}) {
  return (
    <div className="mb-5">
      <label htmlFor={id} className="mb-1.5 block font-mono text-xs font-bold uppercase tracking-[0.18em]" style={{ color: 'var(--muted)' }}>
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-20 w-full resize-none border px-3 py-2.5 text-sm outline-none"
        style={{
          background: 'var(--surface-2)',
          borderColor: 'var(--card-border)',
          color: 'var(--foreground)',
        }}
      />
    </div>
  )
}

function ChoiceGroup<T extends string>({
  label,
  values,
  current,
  onSelect,
}: {
  label: string
  values: [T, string][]
  current: T
  onSelect: (value: T) => void
}) {
  return (
    <fieldset className="mt-5 border-0 p-0">
      <legend className="mb-2 font-mono text-xs font-bold uppercase tracking-[0.18em]" style={{ color: 'var(--muted)' }}>
        {label}
      </legend>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {values.map(([value, text]) => (
          <button
            key={value}
            type="button"
            data-active={current === value}
            aria-pressed={current === value}
            onClick={() => onSelect(value)}
            className="border px-4 py-3 text-left text-sm font-bold"
            style={{
              background: current === value ? 'var(--ink)' : 'var(--surface-2)',
              borderColor: current === value ? 'var(--ink)' : 'var(--card-border)',
              color: current === value ? 'var(--ink-text)' : 'var(--foreground)',
            }}
          >
            {text}
          </button>
        ))}
      </div>
    </fieldset>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b py-3 text-sm last:border-b-0" style={{ borderColor: 'var(--card-border)' }}>
      <span className="font-mono text-xs font-bold uppercase tracking-[0.16em]" style={{ color: 'var(--muted)' }}>{label}</span>
      <span className="text-right font-semibold">{value}</span>
    </div>
  )
}
