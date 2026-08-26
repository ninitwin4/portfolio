'use client'

import Image from 'next/image'
import { useReducedMotion } from 'motion/react'
import type { Media } from '@/app/data'

type ProjectMediaProps = {
  media: Media
  className?: string
  sizes?: string
  priority?: boolean
  fill?: boolean
}

/**
 * Renders either shape of project media. Video autoplays muted and looping,
 * and falls back to its poster still when the visitor prefers reduced motion.
 */
export function ProjectMedia({
  media,
  className,
  sizes,
  priority,
  fill,
}: ProjectMediaProps) {
  const prefersReducedMotion = useReducedMotion() ?? false

  if (media.type === 'video' && !prefersReducedMotion) {
    return (
      <video
        className={className}
        src={media.src}
        poster={media.poster}
        width={media.width}
        height={media.height}
        aria-label={media.alt}
        autoPlay
        muted
        loop
        playsInline
      />
    )
  }

  const src = media.type === 'video' ? media.poster : media.src

  if (fill) {
    return (
      <Image
        src={src}
        alt={media.alt}
        fill
        className={className}
        sizes={sizes}
        priority={priority}
      />
    )
  }

  return (
    <Image
      src={src}
      alt={media.alt}
      width={media.width}
      height={media.height}
      className={className}
      sizes={sizes}
      priority={priority}
    />
  )
}
