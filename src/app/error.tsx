'use client'

import { useEffect } from 'react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center">
      <div className="w-full max-w-md">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-500 mx-auto mb-6">
          <span className="text-2xl font-bold text-zinc-400">!</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Something went wrong</h1>
        <p className="text-zinc-500 text-sm mb-8">
          An unexpected error occurred. Please try again or return to the home page.
        </p>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-black font-semibold px-6 py-3 hover:bg-primary-dark transition-all"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
