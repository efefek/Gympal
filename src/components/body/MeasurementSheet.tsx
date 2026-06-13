'use client'

import { useState, useEffect, useRef } from 'react'
import { Sheet } from '@/components/ui/Sheet'
import { logMeasurement, getMeasurements } from '@/lib/tracker'

export type MeasureField = 'weight' | 'height' | 'arm' | 'waist' | 'chest' | 'bodyFat'

interface MeasurementSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  focusField?: MeasureField
  onSaved?: (isFirst: boolean) => void
}

type FormState = Record<MeasureField, string>

const EMPTY: FormState = { weight: '', height: '', arm: '', waist: '', chest: '', bodyFat: '' }

const FIELDS: { field: MeasureField; label: string; unit: string; min: number; max: number }[] = [
  { field: 'weight', label: 'Weight', unit: 'kg', min: 20, max: 400 },
  { field: 'height', label: 'Height', unit: 'cm', min: 50, max: 250 },
  { field: 'arm', label: 'Arm', unit: 'cm', min: 5, max: 100 },
  { field: 'waist', label: 'Waist', unit: 'cm', min: 30, max: 250 },
  { field: 'chest', label: 'Chest', unit: 'cm', min: 30, max: 250 },
  { field: 'bodyFat', label: 'Body Fat', unit: '%', min: 1, max: 70 },
]

export function MeasurementSheet({ open, onOpenChange, focusField, onSaved }: MeasurementSheetProps) {
  const [form, setForm] = useState<FormState>(EMPTY)
  const [errors, setErrors] = useState<Partial<Record<MeasureField, string>>>({})
  const inputRefs = useRef<Partial<Record<MeasureField, HTMLInputElement | null>>>({})

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
    logMeasurement({
      date: new Date().toISOString().slice(0, 10),
      weight: parsed.weight,
      height: parsed.height,
      armCirc: parsed.arm,
      waistCirc: parsed.waist,
      chest: parsed.chest,
      bodyFat: parsed.bodyFat,
    })
    setForm(EMPTY)
    setErrors({})
    onOpenChange(false)
    onSaved?.(wasEmpty)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="Log Measurement">
      <div className="flex flex-col gap-4 pt-1">
        <div className="grid grid-cols-2 gap-3">
          {FIELDS.map(({ field, label, unit }) => (
            <div key={field}>
              <label htmlFor={`meas-${field}`} className="text-xs block mb-1" style={{ color: 'var(--muted)' }}>
                {label} <span style={{ color: 'var(--muted)' }}>({unit})</span>
              </label>
              <input
                id={`meas-${field}`}
                ref={(el) => { inputRefs.current[field] = el }}
                type="number"
                inputMode="decimal"
                value={form[field]}
                onChange={(e) => set(field, e.target.value)}
                placeholder="—"
                className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                style={{
                  background: 'var(--surface-2)',
                  border: `1px solid ${errors[field] ? 'var(--accent)' : 'var(--card-border)'}`,
                  color: 'var(--foreground)',
                }}
                aria-invalid={errors[field] ? true : undefined}
              />
              {errors[field] && (
                <p className="text-[10px] mt-1" style={{ color: 'var(--accent)' }}>{errors[field]}</p>
              )}
            </div>
          ))}
        </div>

        <button onClick={handleSave} className="btn-ink w-full py-3.5 rounded-2xl font-semibold text-sm">
          Save
        </button>
      </div>
    </Sheet>
  )
}
