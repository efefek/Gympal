"use client"

import { Heart, MessageCircle, MapPin, Clock } from 'lucide-react'
import type { SocialPost } from '@/lib/social'

interface PostCardProps {
  post: SocialPost
  onLike?: (postId: string) => void
}

export function PostCard({ post, onLike }: PostCardProps) {
  const timeAgo = new Date(post.createdAt)
  const now = new Date()
  const diffMinutes = Math.floor((now.getTime() - timeAgo.getTime()) / 60000)
  const timeLabel = diffMinutes < 60 ? `${diffMinutes}m ago` : `${Math.floor(diffMinutes / 60)}h ago`

  return (
    <div className="rounded-2xl border border-zinc-800 bg-surface-1 p-4 animate-fade-in-up">
      <div className="flex items-start gap-3">
        <img
          src={post.userAvatar}
          alt={post.userName}
          className="size-10 rounded-full object-cover"
        />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">{post.userName}</p>
          <p className="text-xs text-zinc-500 flex items-center gap-1">
            <Clock className="size-3" />
            {timeLabel}
          </p>
        </div>
        <span className="text-xs px-2 py-1 rounded-md bg-primary-dim text-primary font-medium">
          {post.type}
        </span>
      </div>

      <p className="text-sm mt-3 text-foreground">{post.content}</p>

      {post.location && (
        <div className="mt-3 flex items-center gap-2 text-xs text-zinc-400">
          <MapPin className="size-3.5" />
          <span>{post.location}</span>
          {post.distance && <span>· {post.distance}km</span>}
        </div>
      )}

      <div className="mt-4 flex items-center gap-4 border-t border-zinc-800 pt-3">
        <button
          onClick={() => onLike?.(post.id)}
          className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-primary transition-colors"
        >
          <Heart className="size-4" />
          <span>{post.likes}</span>
        </button>
        <button className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-primary transition-colors">
          <MessageCircle className="size-4" />
          <span>{post.comments}</span>
        </button>
      </div>
    </div>
  )
}
