'use client'

import { useState } from 'react'
import { PostCard } from '@/components/social/PostCard'
import { EventCard } from '@/components/social/EventCard'
import { MOCK_POSTS, MOCK_EVENTS } from '@/data/mock-social'

export default function SocialPage() {
  const [activeTab, setActiveTab] = useState<'feed' | 'discover' | 'events'>('feed')

  return (
    <div className="mx-auto w-full max-w-lg flex-1 px-5 pt-6 pb-28 md:max-w-2xl">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Social & Community</h1>
        <p className="text-xs text-zinc-500 mt-1">Connect, share, and celebrate achievements</p>
      </header>

      <div className="flex border-b border-zinc-800 mb-6 gap-4">
        {(['feed', 'discover', 'events'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 px-1 text-sm font-medium transition-colors border-b-2 ${
              activeTab === tab
                ? 'border-primary text-primary'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'feed' && (
        <div className="space-y-4">
          {MOCK_POSTS.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {activeTab === 'discover' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-zinc-800 bg-surface-1 p-4 h-64 flex items-center justify-center">
            <p className="text-sm text-zinc-400">Map view coming soon</p>
          </div>
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Nearby Events</h3>
            {MOCK_EVENTS.slice(0, 3).map((event) => (
              <EventCard key={event.id} {...event} />
            ))}
          </div>
        </div>
      )}

      {activeTab === 'events' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {MOCK_EVENTS.map((event) => (
            <EventCard key={event.id} {...event} />
          ))}
        </div>
      )}
    </div>
  )
}
