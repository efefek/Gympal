"use client"

import { MapPin, Users } from 'lucide-react'

interface EventCardProps {
  id: string
  title: string
  date: string
  category: string
  location: string
  participants: number
  distance?: number
}

export function EventCard({ title, date, category, location, participants, distance }: EventCardProps) {
  const eventDate = new Date(date)
  const formatted = eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  return (
    <div className="rounded-xl border border-zinc-800 bg-surface-1 p-3 overflow-hidden animate-fade-in-up">
      <div className="h-1 w-full bg-gradient-to-r from-primary to-primary-dim/50 mb-3" />

      <div className="flex justify-between items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{title}</p>
          <p className="text-xs text-zinc-400 mt-1 inline-block bg-zinc-900/40 px-2 py-0.5 rounded-md">
            {category}
          </p>
        </div>
        <p className="text-xs font-medium text-primary flex-shrink-0">{formatted}</p>
      </div>

      <div className="mt-3 space-y-2 text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <MapPin className="size-3.5" />
          <span>{location}</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="size-3.5" />
          <span>{participants} participants</span>
        </div>
        {distance !== undefined && distance > 0 && (
          <div className="text-xs text-zinc-400">
            {distance}km
          </div>
        )}
      </div>

      <button className="w-full mt-3 py-2 rounded-lg text-xs font-medium bg-primary-dim text-primary hover:bg-primary/20 transition-colors">
        Join Event
      </button>
    </div>
  )
}
