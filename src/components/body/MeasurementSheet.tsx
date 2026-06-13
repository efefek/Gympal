'use client'

import { useEffect, useRef, useState, type RefObject } from 'react'
import { Sheet } from '@/components/ui/Sheet'
import { getMeasurements, getVitals, logMeasurement, logVital, todayKey } from '@/lib/tracker'

export type MeasureField = 'weight' | 'height' | 'arm' | 'thigh' | 'waist' | 'chest' | 'bodyFat' | 'water' | 'protein' | 'food'

interface MeasurementSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  focusField?: MeasureField
  onSaved?: (isFirst: boolean) => void
}

type FormState = Record<MeasureField, string>

const EMPTY: FormState = {
  weight: '',
  height: '',
  arm: '',
  thigh: '',
  waist: '',
  chest: '',
  bodyFat: '',
  water: '',
  protein: '',
  food: '',
}

const MEASURE_FIELDS: { field: MeasureField; label: string; unit: string; min: number; max: number }[] = [
  { field: 'weight', label: 'Weight', unit: 'kg', min: 20, max: 400 },
  { field: 'height', label: 'Height', unit: 'cm', min: 50, max: 250 },
  { field: 'arm', label: 'Arm', unit: 'cm', min: 5, max: 100 },
  { field: 'thigh', label: 'Leg / Thigh', unit: 'cm', min: 20, max: 140 },
  { field: 'waist', label: 'Waist', unit: 'cm', min: 30, max: 250 },
  { field: 'chest', label: 'Chest', unit: 'cm', min: 30, max: 250 },
  { field: 'bodyFat', label: 'Body Fat', unit: '%', min: 1, max: 70 },
]

const INTAKE_FIELDS: { field: MeasureField; label: string; unit: string; min: number; max: number }[] = [
  { field: 'water', label: 'Water', unit: 'ml', min: 0, max: 8000 },
  { field: 'protein', label: 'Protein', unit: 'g', min: 0, max: 400 },
  { field: 'food', label: 'Food', unit: 'kcal', min: 0, max: 8000 },
]

const FIELDS = [...MEASURE_FIELDS, ...INTAKE_FIELDS]

export function MeasurementSheet({ open, onOpenChange, focusField, onSaved }: MeasurementSheetProps) {
  const [form, setForm] = useState<FormState>(EMPTY)
  const [errors, setErrors] = useState<Partial<Record<MeasureField, string>>>({})
  const inputRefs = useRef<Partial<Record<MeasureField, HTMLInputElement | null>>>({})

  useEffect(() => {
    if (!open) return
    const latestMeasurement = getMeasurements().at(-1)
    const todayVital = getVitals().find((vital) => vital.date === todayKey())
    const latestVital = todayVital ?? getVitals().at(-1)
    // eslint-disable-next-line react-hooks/set-state-in-effect -- prefill from client-only localStorage when sheet opens
    setForm({
      weight: formatValue(latestMeasurement?.weight),
      height: formatValue(latestMeasurement?.height),
      arm: formatValue(latestMeasurement?.armCirc),
      thigh: formatValue(latestMeasurement?.thighCirc),
      waist: formatValue(latestMeasurement?.waistCirc),
      chest: formatValue(latestMeasurement?.chest),
      bodyFat: formatValue(latestMeasurement?.bodyFat),
      water: formatValue(latestVital?.waterMl),
      protein: formatValue(latestVital?.proteinG),
      food: formatValue(latestVital?.foodKcal),
    })
  }, [open])

  useEffect(() => {
    if (open && focusField) {
      const id = requestAnimationFrame(() => inputRefs.current[focusField]?.focus())
      return () => cancelAnimationFrame(id)
    }
  }, [open, focusField])

  function set(field: MeasureField, val: string) {
    setForm((prev) => ({ ...prev, [field]: val }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  function handleSave() {
    const nextErrors: Partial<Record<MeasureField, string>> = {}
    const parsed: Partial<Record<MeasureField, number>> = {}

    for (const { field, min, max, unit } of FIELDS) {
      const raw = form[field].trim()
      if (!raw) continue
      const num = Number(raw)
      if (Number.isNaN(num) || num < min || num > max) {
        nextErrors[field] = `${min}–${max} ${unit}`
      } else {
        parsed[field] = num
      }
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }
    if (Object.keys(parsed).length === 0) {
      onOpenChange(false)
      return
    }

    const wasEmpty = getMeasurements().length === 0
    const date = todayKey()
    logMeasurement({
      date,
      weight: parsed.weight,
      height: parsed.height,
      armCirc: parsed.arm,
      thighCirc: parsed.thigh,
      waistCirc: parsed.waist,
      chest: parsed.chest,
      bodyFat: parsed.bodyFat,
    }, date)
    logVital({
      date,
      waterMl: parsed.water,
      proteinG: parsed.protein,
      foodKcal: parsed.food,
    }, date)
    setErrors({})
    onOpenChange(false)
    onSaved?.(wasEmpty)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="Log Measurement">
      <div className="flex flex-col gap-4 pt-1">
        <FieldGrid title="Measurements" fields={MEASURE_FIELDS} form={form} errors={errors} set={set} inputRefs={inputRefs} />
        <FieldGrid title="Intake" fields={INTAKE_FIELDS} form={form} errors={errors} set={set} inputRefs={inputRefs} />

        <button onClick={handleSave} className="btn-ink w-full py-3.5 rounded-2xl font-semibold text-sm">
          Save
        </button>
      </div>
    </Sheet>
  )
}

function FieldGrid({
  title,
  fields,
  form,
  errors,
  set,
  inputRefs,
}: {
  title: string
  fields: typeof FIELDS
  form: FormState
  errors: Partial<Record<MeasureField, string>>
  set: (field: MeasureField, value: string) => void
  inputRefs: RefObject<Partial<Record<MeasureField, HTMLInputElement | null>>>
}) {
  return (
    <section>
      <p className="mb-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: 'var(--muted)' }}>
        {title}
      </p>
      <div className="grid grid-cols-2 gap-3">
        {fields.map(({ field, label, unit }) => (
          <div key={field}>
            <label htmlFor={`meas-${field}`} className="mb-1 block text-xs" style={{ color: 'var(--muted)' }}>
              {label} <span style={{ color: 'var(--muted)' }}>({unit})</span>
            </label>
            <input
              id={`meas-${field}`}
              ref={(el) => { inputRefs.current[field] = el }}
              type="number"
              inputMode="decimal"
              value={form[field]}
              onChange={(event) => set(field, event.target.value)}
              placeholder="-"
              className="w-full border px-3 py-2.5 font-mono text-sm tabular-nums outline-none"
              style={{
                background: 'var(--surface-2)',
                borderColor: errors[field] ? 'var(--accent)' : 'var(--card-border)',
                color: 'var(--foreground)',
              }}
              aria-invalid={errors[field] ? true : undefined}
            />
            {errors[field] && (
              <p className="mt-1 text-[10px]" style={{ color: 'var(--accent)' }}>{errors[field]}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

function formatValue(value: number | undefined): string {
  return value == null ? '' : String(value)
}
