'use client'

import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'

interface NumberScrubberProps {
  id: string
  label: string
  value: number
  min: number
  max: number
  step?: number
  suffix?: string
  decimals?: number
  onChange: (value: number) => void
}

/** Sürüklenebilir sayı girişi: basılı tut + dikey sürükle ile değeri değiştir.
 *  Aktif değer hafif büyür; üstte/altta ±adım ghost değerler %50 / %25 opacity gösterilir.
 *  Klavye: ↑/↓ = ±step, Shift = ×5. role="spinbutton" + aria değerleri. */
const PX_PER_STEP = 8

export function NumberScrubber({
  id,
  label,
  value,
  min,
  max,
  step = 1,
  suffix,
  decimals = 0,
  onChange,
}: NumberScrubberProps) {
  const [dragging, setDragging] = useState(false)
  const drag = useRef<{ startY: number; startValue: number } | null>(null)

  function clamp(next: number): number {
    return Math.max(min, Math.min(max, next))
  }

  function commit(next: number) {
    const rounded = Number(clamp(next).toFixed(decimals))
    if (rounded !== value) onChange(rounded)
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    // Doğrudan input'a tıklama yazmaya izin versin; sürükleme alanı çevre.
    if ((event.target as HTMLElement).tagName === 'INPUT') return
    event.preventDefault()
    drag.current = { startY: event.clientY, startValue: value }
    setDragging(true)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!drag.current) return
    const deltaPx = drag.current.startY - event.clientY
    const deltaSteps = Math.round(deltaPx / PX_PER_STEP)
    commit(drag.current.startValue + deltaSteps * step)
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    drag.current = null
    setDragging(false)
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    const mult = event.shiftKey ? 5 : 1
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      commit(value + step * mult)
    } else if (event.key === 'ArrowDown') {
      event.preventDefault()
      commit(value - step * mult)
    }
  }

  const ghostUp1 = clamp(value + step)
  const ghostUp2 = clamp(value + step * 2)
  const ghostDown1 = clamp(value - step)
  const ghostDown2 = clamp(value - step * 2)
  const fmt = (n: number) => n.toFixed(decimals)

  return (
    <div className="flex flex-col">
      <label htmlFor={id} className="mb-1.5 font-mono text-xs font-bold uppercase tracking-[0.18em]" style={{ color: 'var(--muted)' }}>
        {label}
      </label>
      <div
        className="relative flex touch-none select-none flex-col items-center overflow-hidden py-1"
        style={{
          border: '1.5px solid var(--card-border)',
          background: 'var(--surface-2)',
          borderRadius: 'var(--r-field)',
          cursor: dragging ? 'ns-resize' : 'grab',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Üst ghost'lar (+adım) */}
        <span className="pointer-events-none font-mono text-[11px] tabular-nums leading-tight" style={{ color: 'var(--muted)', opacity: 0.25 }}>
          {fmt(ghostUp2)}
        </span>
        <span className="pointer-events-none font-mono text-xs tabular-nums leading-tight" style={{ color: 'var(--muted)', opacity: 0.5 }}>
          {fmt(ghostUp1)}
        </span>

        {/* Aktif değer — yazılabilir */}
        <div className="flex items-baseline gap-1 transition-transform" style={{ transform: dragging ? 'scale(1.12)' : 'scale(1)' }}>
          <input
            id={id}
            type="number"
            inputMode="decimal"
            role="spinbutton"
            aria-label={label}
            aria-valuenow={value}
            aria-valuemin={min}
            aria-valuemax={max}
            value={value}
            min={min}
            max={max}
            step={step}
            onKeyDown={handleKeyDown}
            onChange={(event) => {
              const next = Number(event.target.value)
              if (Number.isFinite(next)) commit(next)
            }}
            className="no-spinner w-16 bg-transparent text-center font-mono text-2xl font-black tabular-nums outline-none"
            style={{ color: 'var(--foreground)' }}
          />
          {suffix && <span className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>{suffix}</span>}
        </div>

        {/* Alt ghost'lar (−adım) */}
        <span className="pointer-events-none font-mono text-xs tabular-nums leading-tight" style={{ color: 'var(--muted)', opacity: 0.5 }}>
          {fmt(ghostDown1)}
        </span>
        <span className="pointer-events-none font-mono text-[11px] tabular-nums leading-tight" style={{ color: 'var(--muted)', opacity: 0.25 }}>
          {fmt(ghostDown2)}
        </span>
      </div>
    </div>
  )
}
