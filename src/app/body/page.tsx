'use client'

import { useState, useRef } from 'react'
import { Plus, Droplets, Beef, Utensils, Footprints } from 'lucide-react'
import { motion } from 'motion/react'
import { useMounted } from '@/lib/hooks'
import { getMeasurements, getVitals, logVital, todayKey, type HealthVital } from '@/lib/tracker'
import { getProfile, calcBMI, bmiCategory } from '@/lib/profile'
import { AnimatedNumber } from '@/components/ui/AnimatedNumber'
import { MultiTrendChart } from '@/components/body/MultiTrendChart'
import { MeasurementSheet, type MeasureField } from '@/components/body/MeasurementSheet'
import { SnapPager, SnapSection, ParallaxLayer } from '@/components/ui/SnapPager'
import { Sheet } from '@/components/ui/Sheet'
import { NumberScrubber } from '@/components/ui/NumberScrubber'

const HUMAN = { weightMin: 20, weightMax: 400, heightMin: 50, heightMax: 250 }

type Period = 'day' | 'week' | 'month'
const PERIOD_LABELS: Record<Period, string> = { day: 'Today', week: 'This week', month: 'This month' }
const PERIOD_CYCLE: Period[] = ['day', 'week', 'month']
type VitalKey = 'waterMl' | 'proteinG' | 'foodKcal' | 'steps'

/* ─── Aggregation ─────────────────────────────────────────────── */

function vitalAgg(vitals: HealthVital[], field: VitalKey, period: Period): number {
  const today = new Date()
  const filtered = vitals.filter((v) => {
    const d = new Date(v.date)
    const diffDays = (today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
    if (period === 'day')   return v.date === todayKey()
    if (period === 'week')  return diffDays < 7
    return diffDays < 30
  })
  const vals = filtered.map((v) => (v[field] as number | undefined) ?? 0).filter((x) => x > 0)
  if (vals.length === 0) return 0
  return Math.round(vals.reduce((a, b) => a + b, 0))
}

/* ─── Presets ─────────────────────────────────────────────────── */

const VITAL_PRESETS: Record<VitalKey, { label: string; value: number }[]> = {
  waterMl:  [{ label: '250ml', value: 250 }, { label: '500ml', value: 500 }, { label: '1L', value: 1000 }],
  proteinG: [{ label: 'Shake 30g', value: 30 }, { label: 'Chicken 45g', value: 45 }, { label: 'Steak 60g', value: 60 }],
  foodKcal: [{ label: 'Snack 200', value: 200 }, { label: 'Meal 600', value: 600 }, { label: 'Big 900', value: 900 }],
  steps:    [{ label: '1K', value: 1000 }, { label: '5K', value: 5000 }, { label: '10K', value: 10000 }],
}
const VITAL_ICONS: Record<VitalKey, React.ElementType> = {
  waterMl: Droplets, proteinG: Beef, foodKcal: Utensils, steps: Footprints,
}
const VITAL_LABELS: Record<VitalKey, string> = {
  waterMl: 'Water', proteinG: 'Protein', foodKcal: 'Food', steps: 'Steps',
}
const VITAL_UNITS: Record<VitalKey, string> = {
  waterMl: 'ml', proteinG: 'g', foodKcal: 'kcal', steps: 'steps',
}

/* ─── BodyPage ────────────────────────────────────────────────── */

export default function BodyPage() {
  const mounted = useMounted()

  const measurements = mounted ? getMeasurements() : []
  const vitals = mounted ? getVitals() : []
  const profile = mounted ? getProfile() : null

  const [sheetOpen, setSheetOpen] = useState(false)
  const [focusField, setFocusField] = useState<MeasureField | undefined>()
  const [vitalSheetKey, setVitalSheetKey] = useState<VitalKey | null>(null)
  const [customVitalVal, setCustomVitalVal] = useState(0)
  const [periods, setPeriods] = useState<Record<VitalKey, number>>({
    waterMl: 0, proteinG: 0, foodKcal: 0, steps: 0,
  })

  const sectionRef1 = useRef<HTMLDivElement>(null)
  const sectionRef2 = useRef<HTMLDivElement>(null)

  const today = todayKey()
  const todayM = measurements.find((m) => m.date === today) ?? measurements.at(-1)
  const weight  = todayM?.weight  ?? profile?.weight
  const height  = todayM?.height  ?? profile?.height
  const bmiValid = weight != null && height != null
    && weight >= HUMAN.weightMin && weight <= HUMAN.weightMax
    && height >= HUMAN.heightMin && height <= HUMAN.heightMax
  const bmi = bmiValid ? calcBMI(height!, weight!) : null

  function openMeasure(field?: MeasureField) {
    setFocusField(field)
    setSheetOpen(true)
  }

  function cyclePeriod(key: VitalKey) {
    setPeriods((prev) => ({ ...prev, [key]: (prev[key] + 1) % 3 }))
  }

  function openVitalSheet(key: VitalKey) {
    const latestVital = vitals.at(-1)
    setCustomVitalVal((latestVital?.[key] as number | undefined) ?? 0)
    setVitalSheetKey(key)
  }

  function addPreset(key: VitalKey, value: number) {
    const existing = vitals.find((v) => v.date === today)
    const currentVal = (existing?.[key] as number | undefined) ?? 0
    const patch = { date: today, [key]: currentVal + value } as Parameters<typeof logVital>[0]
    logVital(patch)
    setVitalSheetKey(null)
  }

  function saveCustomVital(key: VitalKey) {
    const patch = { date: today, [key]: customVitalVal } as Parameters<typeof logVital>[0]
    logVital(patch)
    setVitalSheetKey(null)
  }

  return (
    <>
      <SnapPager>
        {/* S1 — Body Count */}
        <SnapSection className="px-6 pt-6">
          <div ref={sectionRef1} className="flex flex-col justify-center min-h-[100dvh]">
            <ParallaxLayer sectionRef={sectionRef1 as React.RefObject<HTMLElement>} distance={40}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] mb-3" style={{ color: 'var(--muted)' }}>
                Body Count
              </p>

              {bmi != null ? (
                <button type="button" onClick={() => openMeasure('weight')} aria-label="Edit weight" className="text-left">
                  <p className="text-8xl font-black tracking-tighter leading-none">{bmi.toFixed(1)}</p>
                  <p className="text-sm mt-2 capitalize" style={{ color: 'var(--muted)' }}>
                    BMI · {bmiCategory(bmi)}
                  </p>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => openMeasure('weight')}
                  className="btn-ink flex items-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-bold w-fit mt-4"
                >
                  <Plus className="size-4" aria-hidden="true" />
                  Log weight & height
                </button>
              )}

              <div className="mt-10 flex flex-wrap gap-6">
                {[
                  { field: 'weight'  as MeasureField, label: 'Weight',   value: weight,          unit: 'kg', decimals: 1 },
                  { field: 'height'  as MeasureField, label: 'Height',   value: height,          unit: 'cm', decimals: 0 },
                  { field: 'waist'   as MeasureField, label: 'Waist',    value: todayM?.waistCirc, unit: 'cm', decimals: 0 },
                  { field: 'bodyFat' as MeasureField, label: 'Body Fat', value: todayM?.bodyFat,  unit: '%',  decimals: 1 },
                ].map(({ field, label, value: val, unit, decimals }) => (
                  <button key={field} type="button" onClick={() => openMeasure(field)} className="text-left" aria-label={`Edit ${label}`}>
                    <p className="text-2xl font-black tracking-tight leading-none tabular">
                      {val != null
                        ? <><AnimatedNumber value={val} decimals={decimals} /><span className="text-sm font-normal ml-0.5" style={{ color: 'var(--muted)' }}>{unit}</span></>
                        : <span style={{ color: 'var(--muted)' }}>—</span>}
                    </p>
                    <p className="text-[10px] mt-0.5 uppercase tracking-wider" style={{ color: 'var(--muted)' }}>{label}</p>
                  </button>
                ))}
              </div>
            </ParallaxLayer>
          </div>
        </SnapSection>

        {/* S2 — Trend */}
        <SnapSection className="px-6">
          <div ref={sectionRef2} className="flex flex-col justify-center min-h-[100dvh] py-8">
            <ParallaxLayer sectionRef={sectionRef2 as React.RefObject<HTMLElement>} distance={30}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] mb-5" style={{ color: 'var(--muted)' }}>
                Trend
              </p>
              {mounted && <MultiTrendChart measurements={measurements} vitals={vitals} />}
            </ParallaxLayer>
          </div>
        </SnapSection>

        {/* S3 — Logs */}
        <SnapSection last className="px-6 overflow-y-auto">
          <div className="flex flex-col min-h-[100dvh] py-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] mb-5" style={{ color: 'var(--muted)' }}>
              Logs
            </p>

            <div className="flex flex-col gap-3">
              {(Object.entries(VITAL_ICONS) as [VitalKey, React.ElementType][]).map(([key, Icon]) => {
                const periodIdx = periods[key]
                const period = PERIOD_CYCLE[periodIdx]
                const agg = vitalAgg(vitals, key, period)
                return (
                  <motion.div
                    key={key}
                    className="flex items-center justify-between rounded-2xl px-4 py-3"
                    style={{ background: 'var(--surface-1)', border: '1.5px solid var(--card-border)' }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <button
                      type="button"
                      className="flex items-center gap-3 flex-1 text-left"
                      onClick={() => cyclePeriod(key)}
                      aria-label={`${VITAL_LABELS[key]} — tap to change period`}
                    >
                      <Icon className="size-4 shrink-0" style={{ color: 'var(--muted)' }} aria-hidden="true" />
                      <div>
                        <p className="text-sm font-semibold">{VITAL_LABELS[key]}</p>
                        <p className="text-[10px] uppercase tracking-wider mt-0.5" style={{ color: 'var(--muted)' }}>
                          {PERIOD_LABELS[period]}
                        </p>
                      </div>
                    </button>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-black tabular">
                        {agg > 0 ? agg.toLocaleString() : '—'}
                        {agg > 0 && (
                          <span className="text-xs font-normal ml-0.5" style={{ color: 'var(--muted)' }}>
                            {VITAL_UNITS[key]}
                          </span>
                        )}
                      </span>
                      <button
                        type="button"
                        onClick={() => openVitalSheet(key)}
                        aria-label={`Log ${VITAL_LABELS[key]}`}
                        className="flex size-8 items-center justify-center rounded-full border"
                        style={{ borderColor: 'var(--card-border)', color: 'var(--muted)' }}
                      >
                        <Plus className="size-4" aria-hidden="true" />
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            <button
              type="button"
              onClick={() => openMeasure(undefined)}
              className="btn-ink mt-6 w-full py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2"
            >
              <Plus className="size-4" aria-hidden="true" />
              Log Measurement
            </button>
          </div>
        </SnapSection>
      </SnapPager>

      <MeasurementSheet open={sheetOpen} onOpenChange={setSheetOpen} focusField={focusField} />

      {vitalSheetKey && (
        <VitalLogSheet
          vitalKey={vitalSheetKey}
          customVal={customVitalVal}
          onCustomValChange={setCustomVitalVal}
          onPreset={(v) => addPreset(vitalSheetKey, v)}
          onSaveCustom={() => saveCustomVital(vitalSheetKey)}
          onClose={() => setVitalSheetKey(null)}
        />
      )}
    </>
  )
}

/* ─── VitalLogSheet ──────────────────────────────────────────── */

type VitalLogSheetProps = {
  vitalKey: VitalKey
  customVal: number
  onCustomValChange: (v: number) => void
  onPreset: (v: number) => void
  onSaveCustom: () => void
  onClose: () => void
}

function VitalLogSheet({
  vitalKey, customVal, onCustomValChange, onPreset, onSaveCustom, onClose
}: VitalLogSheetProps) {
  const Icon    = VITAL_ICONS[vitalKey]
  const label   = VITAL_LABELS[vitalKey]
  const unit    = VITAL_UNITS[vitalKey]
  const presets = VITAL_PRESETS[vitalKey]
  const scrubStep = vitalKey === 'steps' ? 100 : vitalKey === 'foodKcal' ? 50 : 10
  const scrubMax  = vitalKey === 'steps' ? 50000 : vitalKey === 'foodKcal' ? 5000 : 2000

  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <div className="flex flex-col gap-5 pt-2">
        <div className="flex items-center gap-3">
          <Icon className="size-5" style={{ color: 'var(--muted)' }} aria-hidden="true" />
          <p className="text-lg font-bold">Log {label}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {presets.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => onPreset(p.value)}
              className="rounded-full border px-4 py-2 text-sm font-medium"
              style={{ borderColor: 'var(--card-border)', background: 'var(--surface-2)' }}
            >
              +{p.label}
            </button>
          ))}
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-wider mb-2" style={{ color: 'var(--muted)' }}>Custom</p>
          <div className="flex items-center gap-3">
            <NumberScrubber
              id={`vital-${vitalKey}`}
              label={label}
              value={customVal}
              onChange={onCustomValChange}
              min={0}
              max={scrubMax}
              step={scrubStep}
              suffix={unit}
            />
            <span className="text-sm" style={{ color: 'var(--muted)' }}>{unit}</span>
          </div>
        </div>

        <button type="button" onClick={onSaveCustom} className="btn-ink w-full py-3.5 rounded-2xl font-semibold text-sm">
          Save {label}
        </button>
      </div>
    </Sheet>
  )
}
