import { bikeRoutes } from '@/lib/places'
import { Route, Bike } from 'lucide-react'

export default function RoutesPage() {
  return (
    <div className="w-full max-w-6xl mx-auto px-5 py-8 md:py-10">
      <div className="mb-6 md:mb-10">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Bike Routes</h1>
        <p className="text-zinc-500 mt-1.5">Best cycling routes in and around London</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {bikeRoutes.map((r) => (
          <div
            key={r.id}
            className="tap-scale group rounded-2xl border border-zinc-800 bg-surface-1 p-5 transition-colors hover:border-primary/40 hover:bg-surface-2 hover:shadow-[0_0_30px_rgba(57,255,20,0.06)]"
          >
            <div className="flex items-start gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary-dim group-hover:bg-primary-mid transition-colors">
                <Bike className="size-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{r.name}</h3>
                <p className="text-sm text-zinc-400 mt-0.5">{r.description}</p>
                <div className="flex gap-3 mt-3 text-xs text-zinc-500">
                  <span className="flex items-center gap-1">
                    <Route className="size-3" />
                    {r.distance}
                  </span>
                  <span className="rounded-md bg-zinc-800 px-2 py-0.5 font-medium text-zinc-400">
                    {r.difficulty}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
