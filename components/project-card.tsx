'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'motion/react'
import { Spotlight } from '@/components/ui/spotlight'
import { ProjectMedia } from '@/components/project-media'
import { cardHover, cardHoverTransition } from '@/lib/motion'
import { getProjectHref, type Project } from '@/app/data'

const CARD_SIZES = '(min-width: 640px) 640px, 100vw'

export function ProjectCard({
  project,
  priority,
}: {
  project: Project
  priority?: boolean
}) {
  const prefersReducedMotion = useReducedMotion() ?? false
  const isConcept = project.kind === 'concept'
  const href = getProjectHref(project)
  const linkClass =
    'group relative block overflow-hidden rounded-[15px] bg-surface'

  const content = (
    <>
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-background">
        <ProjectMedia
          media={project.thumbnail}
          fill
          sizes={CARD_SIZES}
          priority={priority}
          className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>

      <div className="p-4">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-normal text-foreground">{project.title}</h3>
          <span className="shrink-0 font-mono text-sm text-muted">
            {project.year}
          </span>
        </div>
        <p className="mt-1 text-muted">{project.tagline}</p>

        <div className="mt-3 flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-border bg-background px-2.5 py-0.5 font-mono text-xs text-muted"
            >
              {tag}
            </span>
          ))}
        </div>

        <span className="mt-4 inline-flex items-center gap-1 text-sm text-muted transition-colors group-hover:text-accent">
          {isConcept ? 'View concept' : 'View case study'}
          <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
            →
          </span>
        </span>
      </div>
    </>
  )

  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl border border-border bg-surface p-[1px]"
      whileHover={prefersReducedMotion ? undefined : cardHover}
      transition={cardHoverTransition}
    >
      <Spotlight
        className="from-accent/20 via-accent-violet/15 to-accent/20 blur-2xl"
        size={64}
      />
      {/* A concept is a static file in public/, so it gets a plain <a>: Next's
          client router would otherwise try to resolve it as an app route. */}
      {isConcept ? (
        <a href={href} className={linkClass}>
          {content}
        </a>
      ) : (
        <Link href={href} className={linkClass}>
          {content}
        </Link>
      )}
    </motion.div>
  )
}
