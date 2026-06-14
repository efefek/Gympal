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
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] mb-1" style={{ color: 'var(--muted)' }}>
          Community
        </p>
        <h1 className="text-4xl font-bold tracking-tight leading-none">Social</h1>
      </header>

      <div className="flex mb-6 gap-1" style={{ borderBottom: '1px solid var(--card-border)' }}>
        {(['feed', 'discover', 'events'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className="pb-3 px-3 text-sm font-medium transition-colors border-b-2"
            style={
              activeTab === tab
                ? { borderColor: 'var(--foreground)', color: 'var(--foreground)' }
                : { borderColor: 'transparent', color: 'var(--muted)' }
            }
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
          <div
            className="rounded-2xl p-4 h-64 flex items-center justify-center"
            style={{ background: 'var(--surface-1)', border: '1.5px solid var(--card-border)' }}
          >
            <p className="text-sm" style={{ color: 'var(--muted)' }}>Map view coming soon</p>
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
