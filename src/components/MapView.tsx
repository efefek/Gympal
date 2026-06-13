'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Place } from '@/lib/places'

interface MapViewProps {
  places: Place[]
  center?: [number, number]
  zoom?: number
}

export default function MapView({ places, center = [51.5074, -0.1278], zoom = 12 }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return

    const map = L.map(mapRef.current, {
      center,
      zoom,
      zoomControl: true,
    })

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
    }).addTo(map)

    places.forEach((place) => {
      const color = place.type === 'gym' ? '#39ff14' : '#22d3ee'
      const icon = L.divIcon({
        html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid #000;box-shadow:0 0 12px rgba(57,255,20,0.5)"></div>`,
        className: '',
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      })

      L.marker([place.lat, place.lng], { icon })
        .addTo(map)
        .bindPopup(`<div style="font-family:system-ui,sans-serif;padding:4px"><b style="color:#e4e4e7">${place.name}</b><br/><span style="color:#a1a1aa;font-size:13px">${place.description}</span></div>`)
    })

    mapInstance.current = map

    return () => {
      map.remove()
      mapInstance.current = null
    }
  }, [places, center, zoom])

  return <div ref={mapRef} role="region" aria-label="Map of locations" className="w-full h-[400px] rounded-xl border border-zinc-800" />
}
