'use client'
import { useEffect, useState } from 'react'
import { useReducedMotion } from 'motion/react'

interface ProgressRingProps {
  value: number
  max?: number
  size?: number
  strokeWidth?: number
  color?: string
  trackColor?: string
  children?: React.ReactNode
  className?: string
}

export function ProgressRing({
  value,
  max = 100,
  size = 64,
  strokeWidth = 5,
  color = 'var(--ink)',
  trackColor = 'var(--surface-3)',
  children,
  className,
}: ProgressRingProps) {
  const reduced = useReducedMotion()
  const [animated, setAnimated] = useState(0)

  useEffect(() => {
    const raf = requestAnimationFrame(() => setAnimated(value))
    return () => cancelAnimationFrame(raf)
  }, [value])

  const displayed = reduced ? value : animated
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const pct = Math.min(displayed / max, 1)
  const offset = circumference * (1 - pct)

  return (
    <div className={`relative inline-flex items-center justify-center ${className ?? ''}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={trackColor} strokeWidth={strokeWidth} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: reduced ? 'none' : 'stroke-dashoffset 0.7s cubic-bezier(0.22,1,0.36,1)' }}
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  )
}
