'use client'

import { useState } from 'react'

/**
 * Set after running scripts/convert-gifs.mjs and publishing the output,
 * e.g. 'https://cdn.jsdelivr.net/gh/<user>/gympal-videos@main/videos'
 * Empty string = GIF-only mode.
 */
const VIDEO_BASE_URL = process.env.NEXT_PUBLIC_EXERCISE_VIDEO_BASE ?? ''

export function videoUrlFor(slug: string): string | null {
  return VIDEO_BASE_URL ? `${VIDEO_BASE_URL}/${slug}.mp4` : null
}

interface ExerciseMediaProps {
  slug: string
  gifUrl: string
  alt: string
  className?: string
}

/** Renders the exercise demo as a looping MP4 when a video CDN is configured, GIF otherwise. */
export default function ExerciseMedia({ slug, gifUrl, alt, className }: ExerciseMediaProps) {
  const [videoFailed, setVideoFailed] = useState(false)
  const videoUrl = videoUrlFor(slug)

  if (videoUrl && !videoFailed) {
    return (
      <video
        src={videoUrl}
        className={className}
        autoPlay
        loop
        muted
        playsInline
        aria-label={alt}
        onError={() => setVideoFailed(true)}
      />
    )
  }

  return <img src={gifUrl} alt={alt} className={className} loading="lazy" />
}
