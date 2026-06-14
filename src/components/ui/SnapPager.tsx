'use client'

import { useRef, type ReactNode } from 'react'
import { useScroll, useTransform, useReducedMotion, motion } from 'motion/react'

/* ─── SnapPager ─────────────────────────────────────────────
   Tam-sayfa snap-scroll konteyneri. Her çocuk SnapSection bir
   100dvh bölüm. BottomNav yüksekliği için son bölüm alt padding
   alır (pb-safe-nav Tailwind utility). */

type SnapPagerProps = {
  children: ReactNode
  className?: string
}

export function SnapPager({ children, className = '' }: SnapPagerProps) {
  return (
    <div
      className={`h-[100dvh] overflow-y-scroll snap-y snap-mandatory overscroll-contain scrollbar-hide ${className}`}
    >
      {children}
    </div>
  )
}

/* ─── SnapSection ───────────────────────────────────────────
   Tam-sayfa bölüm. children içindeki parallax öğeler için
   useParallax hook'u kullanılır — section'a doğrudan bağımlı
   değil (her bölüm kendi ref'ini yönetir). */

type SnapSectionProps = {
  children: ReactNode
  className?: string
  last?: boolean
}

export function SnapSection({ children, className = '', last = false }: SnapSectionProps) {
  return (
    <section
      className={`snap-start min-h-[100dvh] w-full flex flex-col justify-center ${last ? 'pb-safe-nav' : ''} ${className}`}
    >
      {children}
    </section>
  )
}

/* ─── useParallax ───────────────────────────────────────────
   Bölüm ref'ine bağlı parallax transform. reduceMotion aktifse
   transform identity döner (snap çalışmaya devam eder). */

export function useParallax(ref: React.RefObject<HTMLElement | null>, distance = 60) {
  const shouldReduce = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 1], shouldReduce ? [0, 0] : [-distance, distance])
  return y
}

/* ─── ParallaxLayer ─────────────────────────────────────────
   Bölümün refini alır ve parallax motion.div sarar. */

type ParallaxLayerProps = {
  sectionRef: React.RefObject<HTMLElement | null>
  distance?: number
  children: ReactNode
  className?: string
}

export function ParallaxLayer({ sectionRef, distance, children, className = '' }: ParallaxLayerProps) {
  const y = useParallax(sectionRef, distance)
  return (
    <motion.div style={{ y }} className={className}>
      {children}
    </motion.div>
  )
}
