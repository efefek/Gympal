'use client'

import dynamic from 'next/dynamic'
import type { Place } from '@/lib/places'

const MapView = dynamic(() => import('@/components/MapView'), { ssr: false })

export default function DynamicMapView({ places }: { places: Place[] }) {
  return <MapView places={places} />
}
