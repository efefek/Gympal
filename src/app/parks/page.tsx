import { londonParks } from '@/lib/places'
import { TreePine, MapPin } from 'lucide-react'
import DynamicMapView from '@/components/DynamicMapView'

export default function ParksPage() {
  return (
    <div className="w-full max-w-2xl mx-auto px-5 py-6 pb-28">
      <div className="mb-5">
        <h1 className="text-2xl font-bold tracking-tight">London Parks</h1>
        <p className="text-zinc-500 mt-1 text-sm">Green spaces for outdoor training, running &amp; cycling</p>
      </div>

      <div className="rounded-2xl overflow-hidden mb-6" style={{ height: '55vh' }}>
        <DynamicMapView places={londonParks} />
      </div>

      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{londonParks.length} Parks</span>
      </div>

      <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-1 px-1 pb-2">
        {londonParks.map((park) => (
          <div
            key={park.id}
            className="tap-scale group shrink-0 w-[220px] rounded-2xl border border-zinc-800 bg-surface-1 p-4 transition-colors hover:border-primary/40 hover:bg-surface-2"
          >
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary-dim group-hover:bg-primary-mid transition-colors mb-3">
              <TreePine className="size-5 text-primary" aria-hidden="true" />
            </div>
            <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors leading-snug">{park.name}</h3>
            <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{park.description}</p>
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
