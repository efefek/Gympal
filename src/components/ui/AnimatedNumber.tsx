'use client'
import { useEffect, useRef } from 'react'
import { useMotionValue, useSpring, useTransform, motion, useReducedMotion } from 'motion/react'

interface AnimatedNumberProps {
  value: number
  decimals?: number
  className?: string
}

export function AnimatedNumber({ value, decimals = 0, className }: AnimatedNumberProps) {
  const reduced = useReducedMotion()
  const motionValue = useMotionValue(reduced ? value : 0)
  const spring = useSpring(motionValue, { stiffness: 80, damping: 18, restDelta: 0.001 })
  const display = useTransform(spring, (v) => v.toFixed(decimals))
  const mounted = useRef(false)

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true
      motionValue.set(value)
    } else {
      motionValue.set(value)
    }
  }, [value, motionValue])

  return (
    <motion.span className={className} style={{ fontVariantNumeric: 'tabular-nums' }}>
      {display}
    </motion.span>
  )
}
