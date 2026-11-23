'use client'

import { motion, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Spotlight } from '@/components/ui/spotlight'
import { Magnetic } from '@/components/ui/magnetic'
import { TextEffect } from '@/components/ui/text-effect'
import Link from 'next/link'
import { AnimatedBackground } from '@/components/ui/animated-background'
import { ContactForm } from '@/components/contact-form'
import { ProjectCard } from '@/components/project-card'
import { Container } from '@/components/container'
import { getSectionReveal, sectionRevealTransition } from '@/lib/motion'
import {
  ABOUT,
  BLOG_ENABLED,
  BLOG_POSTS,
  HERO,
  HERO_LINKS,
  PROJECTS,
  TIMELINE,
} from './data'

const SECTION_VIEWPORT = { once: true, margin: '-10% 0px' as const }

const heroTitleClass =
  'hero-display hero-gradient-text text-[clamp(2.75rem,9vw,6rem)] font-bold leading-[1.05] tracking-[-0.03em] text-balance'

const sectionHeadingClass =
  'font-mono text-base font-medium uppercase tracking-widest text-accent-violet'

const pillLinkClass =
  'group relative inline-flex shrink-0 items-center gap-[1px] rounded-full border border-border bg-surface px-2.5 py-1 text-sm text-foreground transition-colors duration-200 hover:border-accent/40 hover:text-accent'

// Projects shown before "View projects". The rest stay in the HTML (for
// search, Cmd+F and print) and are only hidden until expanded.
const VISIBLE_PROJECTS = 3
// Remembers the expanded list for the tab, so "Back to projects" from a
// project further down returns to an open list.
const PROJECTS_EXPANDED_KEY = 'projects-expanded'

function MagneticLink({
  children,
  href,
}: {
  children: ReactNode
  href: string
}) {
  const isEmail = href.startsWith('mailto:')
  const isInternal = href.startsWith('/')

  return (
    <Magnetic springOptions={{ bounce: 0 }} intensity={0.3}>
      <a
        href={href}
        target={isEmail || isInternal ? undefined : '_blank'}
        rel={isEmail || isInternal ? undefined : 'noopener noreferrer'}
        className={pillLinkClass}
      >
        {children}
        {!isEmail && !isInternal && (
          <svg
            width="15"
            height="15"
            viewBox="0 0 15 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-3 w-3"
            aria-hidden="true"
          >
            <path
              d="M3.64645 11.3536C3.45118 11.1583 3.45118 10.8417 3.64645 10.6465L10.2929 4L6 4C5.72386 4 5.5 3.77614 5.5 3.5C5.5 3.22386 5.72386 3 6 3L11.5 3C11.6326 3 11.7598 3.05268 11.8536 3.14645C11.9473 3.24022 12 3.36739 12 3.5L12 9.00001C12 9.27615 11.7761 9.50001 11.5 9.50001C11.2239 9.50001 11 9.27615 11 9.00001V4.70711L4.35355 11.3536C4.15829 11.5488 3.84171 11.5488 3.64645 11.3536Z"
              fill="currentColor"
              fillRule="evenodd"
              clipRule="evenodd"
            />
          </svg>
        )}
      </a>
    </Magnetic>
  )
}

export default function Home() {
  const prefersReducedMotion = useReducedMotion() ?? false
  const sectionReveal = getSectionReveal(prefersReducedMotion)
  const [showAllProjects, setShowAllProjects] = useState(false)
  // Set only by a click, so restoring state on load never steals focus.
  const moveFocus = useRef<'revealed' | 'toggle' | null>(null)
  const firstRevealedRef = useRef<HTMLDivElement>(null)
  const projectsToggleRef = useRef<HTMLButtonElement>(null)
  const projectsRef = useRef<HTMLElement>(null)

  useEffect(() => {
    try {
      if (sessionStorage.getItem(PROJECTS_EXPANDED_KEY) === '1') {
        setShowAllProjects(true)
      }
    } catch {}
  }, [])

  useEffect(() => {
    try {
      sessionStorage.setItem(PROJECTS_EXPANDED_KEY, showAllProjects ? '1' : '0')
    } catch {}
    if (moveFocus.current === 'revealed') {
      firstRevealedRef.current
        ?.querySelector<HTMLElement>('a')
        ?.focus({ preventScroll: true })
    } else if (moveFocus.current === 'toggle') {
      projectsToggleRef.current?.focus({ preventScroll: true })
    }
    moveFocus.current = null
  }, [showAllProjects])

  function expandProjects() {
    moveFocus.current = 'revealed'
    setShowAllProjects(true)
  }

  function collapseProjects() {
    moveFocus.current = 'toggle'
    setShowAllProjects(false)
    // The rows above the viewport just disappeared; bring the list back up.
    projectsRef.current?.scrollIntoView({
      block: 'start',
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    })
  }

  return (
    <motion.main initial={false}>
      {/* Full-bleed, one full screen tall, content anchored low.
          Deliberately NOT wrapped in the scroll-reveal: this fills the whole
          first screen, so gating its opacity on a JS animation means a blank
          page if that animation never runs. TextEffect handles the entrance. */}
      <section
        id="hero"
        className="relative flex min-h-svh flex-col justify-center py-24"
      >
        <Container>
          <TextEffect
            as="h1"
            preset="fade"
            per="char"
            className={heroTitleClass}
            delay={0.2}
          >
            {HERO.name}
          </TextEffect>

          <div className="mt-10 grid gap-8 sm:grid-cols-2 sm:gap-12">
            <p className="text-lg leading-relaxed text-foreground text-balance">
              {HERO.tagline}
            </p>
            <div className="space-y-3">
              {HERO.intro.map((paragraph) => (
                <p
                  key={paragraph}
                  className="text-sm leading-relaxed whitespace-pre-line text-pretty text-muted"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-2">
            {HERO_LINKS.map((link) => (
              <MagneticLink key={link.label} href={link.href}>
                {link.label}
              </MagneticLink>
            ))}
          </div>
        </Container>

        <Container className="absolute inset-x-0 bottom-10 hidden sm:block">
          <a
            href="#about"
            aria-label="Scroll to about"
            className="inline-flex text-muted transition-colors hover:text-accent"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className={prefersReducedMotion ? undefined : 'animate-bounce-slow'}
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </a>
        </Container>
      </section>

      <Container className="space-y-24 pb-8">
      <motion.section
        id="about"
        className="scroll-mt-16"
        variants={sectionReveal}
        initial="hidden"
        whileInView="visible"
        viewport={SECTION_VIEWPORT}
        transition={sectionRevealTransition}
      >
        <h2 className={`${sectionHeadingClass} mb-5`}>
          About
        </h2>
        <div className="space-y-4">
          {ABOUT.paragraphs.map((paragraph) => (
            <p key={paragraph} className="text-muted">
              {paragraph}
            </p>
          ))}
        </div>
      </motion.section>

      <motion.section
        id="projects"
        ref={projectsRef}
        className="scroll-mt-16"
        variants={sectionReveal}
        initial="hidden"
        whileInView="visible"
        viewport={SECTION_VIEWPORT}
        transition={sectionRevealTransition}
      >
        <h2 className={`${sectionHeadingClass} mb-5`}>
          Projects
        </h2>
        <div id="project-list" className="flex flex-col gap-6">
          {PROJECTS.map((project, index) => (
            <div
              key={project.slug}
              ref={index === VISIBLE_PROJECTS ? firstRevealedRef : undefined}
              hidden={!showAllProjects && index >= VISIBLE_PROJECTS}
            >
              <ProjectCard project={project} priority={index === 0} />
            </div>
          ))}
        </div>

        {PROJECTS.length > VISIBLE_PROJECTS && (
          <div className="mt-6 flex justify-center">
            <button
              ref={projectsToggleRef}
              type="button"
              aria-expanded={showAllProjects}
              aria-controls="project-list"
              onClick={showAllProjects ? collapseProjects : expandProjects}
              className={`${pillLinkClass} cursor-pointer gap-1.5 px-4 py-2`}
            >
              {showAllProjects ? 'Show fewer' : 'View projects'}
              <span aria-hidden="true">{showAllProjects ? '↑' : '↓'}</span>
            </button>
          </div>
        )}
      </motion.section>

      <motion.section
        id="timeline"
        variants={sectionReveal}
        initial="hidden"
        whileInView="visible"
        viewport={SECTION_VIEWPORT}
        transition={sectionRevealTransition}
      >
        <h2 className={`${sectionHeadingClass} mb-5`}>
          Timeline
        </h2>
        <div className="flex flex-col space-y-2">
          {TIMELINE.map((entry) => (
            <div
              className="relative overflow-hidden rounded-2xl border border-border bg-surface p-[1px]"
              key={entry.id}
            >
              <Spotlight
                className="from-accent/20 via-accent-violet/15 to-accent/20 blur-2xl"
                size={64}
              />
              <div className="relative h-full w-full rounded-[15px] bg-surface p-4">
                <div className="relative flex w-full flex-col gap-1 sm:flex-row sm:justify-between">
                  <div>
                    <h3 className="font-normal text-foreground">{entry.title}</h3>
                    <p className="text-muted">{entry.description}</p>
                  </div>
                  <p className="shrink-0 font-mono text-sm text-muted">
                    {entry.date}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      <motion.section
        id="contact"
        variants={sectionReveal}
        initial="hidden"
        whileInView="visible"
        viewport={SECTION_VIEWPORT}
        transition={sectionRevealTransition}
      >
        <h2 className={`${sectionHeadingClass} mb-5`}>
          Contact
        </h2>
        <ContactForm />
      </motion.section>

      {BLOG_ENABLED && (
        <motion.section
          id="blog"
          variants={sectionReveal}
          initial="hidden"
          whileInView="visible"
          viewport={SECTION_VIEWPORT}
          transition={sectionRevealTransition}
        >
          <h2 className={`${sectionHeadingClass} mb-3`}>
            Blog
          </h2>
          <div className="flex flex-col space-y-0">
            <AnimatedBackground
              enableHover
              className="h-full w-full rounded-lg bg-surface"
              transition={{
                type: 'spring',
                bounce: 0,
                duration: 0.2,
              }}
            >
              {BLOG_POSTS.map((post) => (
                <Link
                  key={post.uid}
                  className="-mx-3 rounded-xl px-3 py-3"
                  href={post.link}
                  data-id={post.uid}
                >
                  <div className="flex flex-col space-y-1">
                    <h3 className="font-normal text-foreground">{post.title}</h3>
                    <p className="text-muted">{post.description}</p>
                  </div>
                </Link>
              ))}
            </AnimatedBackground>
          </div>
        </motion.section>
      )}
      </Container>
    </motion.main>
  )
}
