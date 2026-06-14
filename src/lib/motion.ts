'use client'
import { useReducedMotion } from 'motion/react'

export const motionTokens = {
  duration: { fast: 0.18, normal: 0.35, slow: 0.6 },
  ease: {
    smooth: [0.22, 1, 0.36, 1] as [number, number, number, number],
    sharp: [0.4, 0, 0.2, 1] as [number, number, number, number],
  },
  distance: { sm: 8, md: 16, lg: 24 },
  spring: { type: 'spring' as const, stiffness: 400, damping: 30 },
}

export function useMotionVariants() {
  const reduced = useReducedMotion()

  const fadeUp = {
    hidden: { opacity: 0, y: reduced ? 0 : motionTokens.distance.md },
    visible: { opacity: 1, y: 0, transition: { duration: motionTokens.duration.normal, ease: motionTokens.ease.smooth } },
  }

  const scaleIn = {
    hidden: { opacity: 0, scale: reduced ? 1 : 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: motionTokens.duration.normal, ease: motionTokens.ease.smooth } },
  }

  const staggerContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
  }

  const sheetVariants = {
    hidden: { opacity: 0, y: reduced ? 0 : 20 },
    visible: { opacity: 1, y: 0, transition: { duration: motionTokens.duration.fast, ease: motionTokens.ease.smooth } },
  }

  return { fadeUp, scaleIn, staggerContainer, sheetVariants }
}
