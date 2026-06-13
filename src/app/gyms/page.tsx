import { londonGyms } from '@/lib/places'
import { MapPin, Dumbbell } from 'lucide-react'
import DynamicMapView from '@/components/DynamicMapView'

export default function GymsPage() {
  const gyms = londonGyms.filter((p) => p.type === 'gym')

  return (
    <div className="w-full max-w-2xl mx-auto px-5 py-6 pb-28">
      <div className="mb-5">
        <h1 className="text-2xl font-bold tracking-tight">Gyms Near You</h1>
        <p className="text-zinc-500 mt-1 text-sm">Fitness centres &amp; training spots across London</p>
      </div>

      <div className="rounded-2xl overflow-hidden mb-6" style={{ height: '55vh' }}>
        <DynamicMapView places={londonGyms} />
      </div>

      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{gyms.length} Gyms</span>
      </div>

      <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-1 px-1 pb-2">
        {gyms.map((gym) => (
          <div
            key={gym.id}
            className="tap-scale group shrink-0 w-[220px] rounded-2xl border border-zinc-800 bg-surface-1 p-4 transition-colors hover:border-primary/40 hover:bg-surface-2"
          >
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary-dim group-hover:bg-primary-mid transition-colors mb-3">
              <Dumbbell className="size-5 text-primary" aria-hidden="true" />
            </div>
            <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors leading-snug">{gym.name}</h3>
            <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{gym.description}</p>
            <div className="flex items-center gap-1 mt-2.5 text-[11px] text-zinc-600">
              <MapPin className="size-3" aria-hidden="true" />
              London
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
