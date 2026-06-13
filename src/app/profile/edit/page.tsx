'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dumbbell, ArrowRight, ArrowLeft, Check, RotateCcw,
  Home, Building2, User, Cable, Armchair, StretchHorizontal,
  Activity, type LucideIcon,
} from 'lucide-react'
import {
  getProfile, saveProfile, clearProfile,
  type UserProfile, type Goal, type Experience, type EquipmentType, type WorkoutLocation,
  goalLabels, experienceLabels, equipmentLabels,
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

type Step = 'basics' | 'equipment' | 'summary'

const DEFAULT_FORM: UserProfile = {
  height: 175,
  weight: 75,
  goal: 'general_fitness',
  experience: 'beginner',
  equipment: ['bodyweight'],
  location: 'home',
}

export default function ProfileEditPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('basics')
  const [saved, setSaved] = useState(false)

  const [form, setForm] = useState<UserProfile>(DEFAULT_FORM)

  useEffect(() => {
    const existing = getProfile()
    if (existing) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- prefill form from client-only localStorage after mount
      setForm(existing)
      setStep('summary')
    }
  }, [])

  function update<T>(field: string, value: T) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSave() {
    saveProfile(form)
    setSaved(true)
    setTimeout(() => router.push('/profile'), 1000)
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
        ? prev.equipment.filter((e) => e !== eq)
        : [...prev.equipment, eq],
    }))
  }

  if (saved) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-primary-dim text-primary mb-6">
          <Check className="size-8" aria-hidden="true" />
        </div>
        <div role="status" aria-live="polite">
          <h1 className="text-2xl font-bold text-foreground">Profile Saved!</h1>
          <p className="text-zinc-500 mt-2">Opening your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="flex items-center gap-3 mb-8">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary-dim text-primary">
            <Dumbbell className="size-5" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              {step === 'basics' && 'Tell us about yourself'}
              {step === 'equipment' && 'What equipment do you have?'}
              {step === 'summary' && 'Your Profile'}
            </h1>
            <p className="text-sm text-zinc-500">
              {step === 'basics' && "We'll tailor exercises to your goals"}
              {step === 'equipment' && 'Select what you have available'}
              {step === 'summary' && 'Review and save your profile'}
            </p>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {(['basics', 'equipment', 'summary'] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`flex size-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
                  step === s
                    ? 'bg-primary text-black'
                    : ['basics', 'equipment'].indexOf(step) >= i
                    ? 'bg-primary-dim text-primary'
                    : 'bg-zinc-800 text-zinc-500'
                }`}
              >
                {i + 1}
              </div>
              {i < 2 && <div className="w-8 h-px bg-zinc-800" />}
            </div>
          ))}
        </div>

        {/* Step 1: Basics */}
        {step === 'basics' && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="profile-height" className="block text-sm font-medium text-zinc-400 mb-1.5">Height (cm)</label>
                <input
                  id="profile-height"
                  type="number"
                  value={form.height}
                  onChange={(e) => update('height', Math.max(100, Math.min(250, Number(e.target.value))))}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                />
              </div>
              <div>
                <label htmlFor="profile-weight" className="block text-sm font-medium text-zinc-400 mb-1.5">Weight (kg)</label>
                <input
                  id="profile-weight"
                  type="number"
                  value={form.weight}
                  onChange={(e) => update('weight', Math.max(30, Math.min(300, Number(e.target.value))))}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>

            <fieldset className="border-0 p-0 m-0">
              <legend className="block text-sm font-medium text-zinc-400 mb-1.5">Your Goal</legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(Object.entries(goalLabels) as [Goal, string][]).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={form.goal === value}
                    onClick={() => update('goal', value)}
                    className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all ${
                      form.goal === value
                        ? 'border-primary/40 bg-primary-dim text-primary'
                        : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="border-0 p-0 m-0">
              <legend className="block text-sm font-medium text-zinc-400 mb-1.5">Experience Level</legend>
              <div className="flex gap-2">
                {(Object.entries(experienceLabels) as [Experience, string][]).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={form.experience === value}
                    onClick={() => update('experience', value)}
                    className={`flex-1 rounded-xl border px-4 py-3 text-center text-sm font-medium transition-all ${
                      form.experience === value
                        ? 'border-primary/40 bg-primary-dim text-primary'
                        : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </fieldset>

            <button
              type="button"
              onClick={() => setStep('equipment')}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary text-black font-semibold py-3 hover:bg-primary-dark transition-all mt-6"
            >
              Next <ArrowRight className="size-4" aria-hidden="true" />
            </button>
          </div>
        )}

        {/* Step 2: Equipment */}
        {step === 'equipment' && (
          <div className="space-y-5">
            <fieldset className="border-0 p-0 m-0">
              <legend className="block text-sm font-medium text-zinc-400 mb-1.5">Where do you work out?</legend>
              <div className="flex gap-2">
                {(['home', 'gym'] as WorkoutLocation[]).map((loc) => {
                  const Icon = loc === 'gym' ? Building2 : Home
                  return (
                    <button
                      key={loc}
                      type="button"
                      aria-pressed={form.location === loc}
                      onClick={() => update('location', loc)}
                      className={`flex-1 flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-center text-sm font-medium transition-all ${
                        form.location === loc
                          ? 'border-primary/40 bg-primary-dim text-primary'
                          : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <Icon className="size-4" aria-hidden="true" />
                      {loc === 'gym' ? 'Gym' : 'Home'}
                    </button>
                  )
                })}
              </div>
            </fieldset>

            {form.location === 'home' && (
              <fieldset className="border-0 p-0 m-0">
                <legend className="block text-sm font-medium text-zinc-400 mb-1.5">Available Equipment</legend>
                <div className="grid grid-cols-2 gap-2">
                  {equipmentOptions.map((eq) => {
                    const Icon = equipmentIcon[eq]
                    return (
                      <button
                        key={eq}
                        type="button"
                        aria-pressed={form.equipment.includes(eq)}
                        onClick={() => toggleEquipment(eq)}
                        className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all ${
                          form.equipment.includes(eq)
                            ? 'border-primary/40 bg-primary-dim text-primary'
                            : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        <Icon className="size-4 shrink-0" aria-hidden="true" />
                        <span>{equipmentLabels[eq]}</span>
                        {form.equipment.includes(eq) && (
                          <Check className="size-3.5 ml-auto shrink-0" aria-hidden="true" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </fieldset>
            )}

            {form.location === 'gym' && (
              <div className="rounded-xl border border-primary/20 bg-primary-dim/30 p-4 text-sm text-zinc-300">
                <p className="font-medium text-primary mb-1">Full Equipment Access</p>
                <p>All exercises will be shown since you have access to a gym with full equipment.</p>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setStep('basics')}
                className="flex items-center justify-center gap-2 rounded-xl border border-zinc-800 text-zinc-300 font-medium py-3 px-6 hover:bg-zinc-900 transition-all"
              >
                <ArrowLeft className="size-4" aria-hidden="true" /> Back
              </button>
              <button
                type="button"
                onClick={() => setStep('summary')}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary text-black font-semibold py-3 hover:bg-primary-dark transition-all"
              >
                Review <ArrowRight className="size-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Summary */}
        {step === 'summary' && (
          <div className="space-y-5">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Height</span>
                <span className="text-foreground font-medium">{form.height} cm</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Weight</span>
                <span className="text-foreground font-medium">{form.weight} kg</span>
              </div>
              <div className="h-px bg-zinc-800" />
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Goal</span>
                <span className="text-primary font-medium">{goalLabels[form.goal]}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Experience</span>
                <span className="text-foreground font-medium">{experienceLabels[form.experience]}</span>
              </div>
              <div className="h-px bg-zinc-800" />
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Location</span>
                <span className="text-foreground font-medium">{form.location === 'gym' ? 'Gym' : 'Home'}</span>
              </div>
              {form.location === 'home' && (
                <div className="flex justify-between text-sm gap-4">
                  <span className="text-zinc-500 shrink-0">Equipment</span>
                  <span className="text-foreground font-medium text-right">
                    {form.equipment.map((e) => equipmentLabels[e]).join(', ')}
                  </span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleSave}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary text-black font-semibold py-3 hover:bg-primary-dark transition-all"
            >
              <Check className="size-4" aria-hidden="true" /> Save Profile
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-zinc-800 text-zinc-500 font-medium py-2.5 hover:text-zinc-300 transition-all text-sm"
            >
              <RotateCcw className="size-3.5" aria-hidden="true" /> Reset
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
