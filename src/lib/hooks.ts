'use client'

import { useEffect, useState } from 'react'

/**
 * Returns false on the server and the first client render, true afterwards.
 * Use to gate localStorage-derived UI so SSR markup matches the first client paint
 * (prevents hydration mismatches in the local-first dashboard).
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot mount flag; intentional single re-render
    setMounted(true)
  }, [])
  return mounted
}
