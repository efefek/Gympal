'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { ChevronRight, Plus } from 'lucide-react'
import { useMounted } from '@/lib/hooks'
import { getMeasurements, getVitals, todayKey } from '@/lib/tracker'
import { getProfile, calcBMI, bmiCategory } from '@/lib/profile'
import { useMotionVariants } from '@/lib/motion'
import { AnimatedNumber } from '@/components/ui/AnimatedNumber'
import { MetricChart } from '@/components/body/MetricChart'
import { VitalsGrid } from '@/components/body/VitalsGrid'
import { MeasurementSheet, type MeasureField } from '@/components/body/MeasurementSheet'

type Range = '1W' | '1M' | '3M' | '1Y'

const HUMAN = { weightMin: 20, weightMax: 400, heightMin: 50, heightMax: 250 }

export default function BodyPage() {
  const mounted = useMounted()
  const { staggerContainer, fadeUp } = useMotionVariants()
  const [range, setRange] = useState<Range>('1W')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [focusField, setFocusField] = useState<MeasureField | undefined>(undefined)

  const measurements = mounted ? getMeasurements() : []
  const vitals = mounted ? getVitals() : []
  const profile = mounted ? getProfile() : null
  const today = todayKey()
  const todayMeasurement = measurements.find((m) => m.date === today)

  const weight = todayMeasurement?.weight ?? profile?.weight
  const height = todayMeasurement?.height ?? profile?.height
  const bmiValid =
    weight != null && height != null &&
    weight >= HUMAN.weightMin && weight <= HUMAN.weightMax &&
    height >= HUMAN.heightMin && height <= HUMAN.heightMax
  const bmi = bmiValid ? calcBMI(height!, weight!) : null

  const rows: { field: MeasureField; label: string; value?: number; unit: string; decimals?: number }[] = [
    { field: 'weight', label: 'Weight', value: weight, unit: 'kg', decimals: 1 },
    { field: 'height', label: 'Height', value: height, unit: 'cm' },
    { field: 'waist', label: 'Waist', value: todayMeasurement?.waistCirc, unit: 'cm' },
    { field: 'arm', label: 'Arm', value: todayMeasurement?.armCirc, unit: 'cm' },
    { field: 'chest', label: 'Chest', value: todayMeasurement?.chest, unit: 'cm' },
    { field: 'bodyFat', label: 'Body Fat', value: todayMeasurement?.bodyFat, unit: '%' },
  ]

  function openSheet(field?: MeasureField) {
    setFocusField(field)
    setSheetOpen(true)
  }

  if (!mounted) return null

  return (
    <motion.div
      className="mx-auto w-full max-w-lg flex-1 px-5 pt-7 pb-40 md:max-w-2xl"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.header variants={fadeUp} className="mb-7 flex items-end justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] mb-1" style={{ color: 'var(--muted)' }}>
            Health
          </p>
          <h1 className="text-4xl font-bold tracking-tight leading-none">Body</h1>
        </div>
        {bmi != null && (
          <div className="text-right">
            <p className="text-3xl font-bold tabular leading-none">{bmi.toFixed(1)}</p>
            <p className="text-[11px] mt-1 capitalize" style={{ color: 'var(--muted)' }}>BMI · {bmiCategory(bmi)}</p>
          </div>
        )}
      </motion.header>

      {/* Measurement list */}
      <motion.div
        variants={fadeUp}
        className="rounded-3xl border overflow-hidden mb-7"
        style={{ background: 'var(--surface-1)', borderColor: 'var(--card-border)' }}
      >
        {rows.map((row, i) => (
          <button
            key={row.field}
            onClick={() => openSheet(row.field)}
            className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors"
            style={{ borderTop: i === 0 ? 'none' : '1px solid var(--card-border)' }}
            aria-label={`Edit ${row.label}`}
          >
            <span className="text-sm" style={{ color: 'var(--muted)' }}>{row.label}</span>
            <span className="flex items-center gap-2">
              <span className="text-xl font-bold tabular" style={{ color: row.value != null ? 'var(--foreground)' : 'var(--muted)' }}>
                {row.value != null ? (
                  <>
                    <AnimatedNumber value={row.value} decimals={row.decimals ?? 0} />
                    <span className="text-xs font-normal ml-0.5" style={{ color: 'var(--muted)' }}>{row.unit}</span>
                  </>
                ) : '—'}
              </span>
              <ChevronRight className="size-4" style={{ color: 'var(--muted)' }} aria-hidden="true" />
            </span>
          </button>
        ))}
      </motion.div>

      {/* Trend chart */}
      <motion.div variants={fadeUp} className="mb-7">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] mb-3" style={{ color: 'var(--muted)' }}>Trend</p>
        <MetricChart measurements={measurements} range={range} onRangeChange={setRange} />
      </motion.div>

      {/* Vitals */}
      <motion.div variants={fadeUp} className="mb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] mb-3" style={{ color: 'var(--muted)' }}>Vitals</p>
        <VitalsGrid vitals={vitals} />
      </motion.div>

      {/* Sticky CTA */}
      <motion.div variants={fadeUp} className="fixed bottom-20 left-0 right-0 px-5 pointer-events-none z-30">
        <div className="mx-auto max-w-lg md:max-w-2xl">
          <motion.button
            onClick={() => openSheet(undefined)}
            className="btn-ink w-full pointer-events-auto py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2"
            style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.18)' }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus className="size-4" aria-hidden="true" />
            Log Measurement
          </motion.button>
        </div>
      </motion.div>

      <MeasurementSheet open={sheetOpen} onOpenChange={setSheetOpen} focusField={focusField} />
    </motion.div>
  )
}
