'use client'

import { motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'
import { Spotlight } from '@/components/ui/spotlight'
import { Magnetic } from '@/components/ui/magnetic'
import { TextEffect } from '@/components/ui/text-effect'
import Link from 'next/link'
import { AnimatedBackground } from '@/components/ui/animated-background'
import { ContactForm } from '@/components/contact-form'
import {
  cardHover,
  cardHoverTransition,
  getSectionReveal,
  sectionRevealTransition,
} from '@/lib/motion'
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
  'hero-gradient-text text-4xl font-medium leading-tight text-balance sm:text-5xl'

const sectionHeadingClass =
  'font-mono text-base font-medium uppercase tracking-widest text-accent-violet'

const pillLinkClass =
  'group relative inline-flex shrink-0 items-center gap-[1px] rounded-full border border-border bg-surface px-2.5 py-1 text-sm text-foreground transition-colors duration-200 hover:border-accent/40 hover:text-accent'

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

  return (
    <motion.main className="space-y-24" initial={false}>
      <motion.section
        id="hero"
        variants={sectionReveal}
        initial="hidden"
        animate="visible"
        transition={sectionRevealTransition}
      >
        <TextEffect
          as="h1"
          preset="fade"
          per="char"
          className={heroTitleClass}
          delay={0.2}
        >
          {HERO.name}
        </TextEffect>
        <TextEffect
          as="p"
          preset="fade"
          per="char"
          className="mt-1 text-xl text-muted"
          delay={0.5}
        >
          {HERO.title}
        </TextEffect>
        <p className="mt-4 text-muted">{HERO.tagline}</p>
        <div className="mt-6 flex flex-wrap items-center gap-2">
          {HERO_LINKS.map((link) => (
            <MagneticLink key={link.label} href={link.href}>
              {link.label}
            </MagneticLink>
          ))}
        </div>
      </motion.section>

      <motion.section
        id="about"
        variants={sectionReveal}
        initial="hidden"
        whileInView="visible"
        viewport={SECTION_VIEWPORT}
        transition={sectionRevealTransition}
      >
        <h2 className={`${sectionHeadingClass} mb-5`}>
          About
        </h2>
        <p className="text-muted">{ABOUT.text}</p>
      </motion.section>

      <motion.section
        id="projects"
        variants={sectionReveal}
        initial="hidden"
        whileInView="visible"
        viewport={SECTION_VIEWPORT}
        transition={sectionRevealTransition}
      >
        <h2 className={`${sectionHeadingClass} mb-5`}>
          Projects
        </h2>
        <div className="flex flex-col gap-4">
          {PROJECTS.map((project) => (
            <motion.div
              key={project.id}
              className="relative overflow-hidden rounded-2xl border border-border bg-surface p-[1px]"
              whileHover={prefersReducedMotion ? undefined : cardHover}
              transition={cardHoverTransition}
            >
              <Spotlight
                className="from-accent/20 via-accent-violet/15 to-accent/20 blur-2xl"
                size={64}
              />
              <div className="relative rounded-[15px] bg-surface p-4">
                <h3 className="font-normal text-foreground">{project.title}</h3>
                <p className="mt-1 text-muted">{project.description}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {project.tech.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-border bg-background px-2.5 py-0.5 font-mono text-xs text-muted"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-4 flex gap-4 text-sm">
                  <a
                    href={project.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted underline underline-offset-2 transition-colors hover:text-accent"
                  >
                    Repo
                  </a>
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted underline underline-offset-2 transition-colors hover:text-accent"
                  >
                    Demo
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
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
    </motion.main>
  )
}
