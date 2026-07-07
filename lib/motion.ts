import type { TargetAndTransition, Transition, Variants } from 'motion/react'

export function getSectionReveal(prefersReducedMotion: boolean): Variants {
  if (prefersReducedMotion) {
    return {
      hidden: { opacity: 1, y: 0 },
      visible: { opacity: 1, y: 0 },
    }
  }

  return {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0 },
  }
}

export const sectionRevealTransition: Transition = {
  duration: 0.4,
  ease: 'easeOut',
}

export const cardHover: TargetAndTransition = {
  y: -2,
  boxShadow: '0 8px 30px -12px color-mix(in srgb, var(--theme-accent) 25%, transparent)',
}

export const cardHoverTransition: Transition = {
  duration: 0.2,
  ease: 'easeOut',
}
