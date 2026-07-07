'use client'
import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { Spotlight } from '@/components/ui/spotlight'
import { Magnetic } from '@/components/ui/magnetic'
import { TextEffect } from '@/components/ui/text-effect'
import Link from 'next/link'
import { AnimatedBackground } from '@/components/ui/animated-background'
import { ContactForm } from '@/components/contact-form'
import {
  ABOUT,
  BLOG_ENABLED,
  BLOG_POSTS,
  HERO,
  HERO_LINKS,
  PROJECTS,
  TIMELINE,
} from './data'

const VARIANTS_CONTAINER = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
}

const VARIANTS_SECTION = {
  hidden: { opacity: 0, y: 20, filter: 'blur(8px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
}

const TRANSITION_SECTION = {
  duration: 0.3,
}

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
        className="group relative inline-flex shrink-0 items-center gap-[1px] rounded-full bg-zinc-100 px-2.5 py-1 text-sm text-black transition-colors duration-200 hover:bg-zinc-950 hover:text-zinc-50 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
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
  return (
    <motion.main
      className="space-y-24"
      variants={VARIANTS_CONTAINER}
      initial="hidden"
      animate="visible"
    >
      <motion.section
        id="hero"
        variants={VARIANTS_SECTION}
        transition={TRANSITION_SECTION}
      >
        <TextEffect
          as="h1"
          preset="fade"
          per="char"
          className="text-2xl font-medium text-black dark:text-white"
          delay={0.2}
        >
          {HERO.name}
        </TextEffect>
        <TextEffect
          as="p"
          preset="fade"
          per="char"
          className="mt-1 text-zinc-600 dark:text-zinc-500"
          delay={0.5}
        >
          {HERO.title}
        </TextEffect>
        <p className="mt-4 text-zinc-600 dark:text-zinc-400">
          {HERO.tagline}
        </p>
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
        variants={VARIANTS_SECTION}
        transition={TRANSITION_SECTION}
      >
        <h2 className="mb-5 text-lg font-medium">About</h2>
        <p className="text-zinc-600 dark:text-zinc-400">{ABOUT.text}</p>
      </motion.section>

      <motion.section
        id="projects"
        variants={VARIANTS_SECTION}
        transition={TRANSITION_SECTION}
      >
        <h2 className="mb-5 text-lg font-medium">Projects</h2>
        <div className="flex flex-col gap-4">
          {PROJECTS.map((project) => (
            <div
              key={project.id}
              className="relative overflow-hidden rounded-2xl bg-zinc-300/30 p-[1px] dark:bg-zinc-600/30"
            >
              <Spotlight
                className="from-zinc-900 via-zinc-800 to-zinc-700 blur-2xl dark:from-zinc-100 dark:via-zinc-200 dark:to-zinc-50"
                size={64}
              />
              <div className="relative rounded-[15px] bg-white p-4 dark:bg-zinc-950">
                <h3 className="font-normal text-zinc-900 dark:text-zinc-100">
                  {project.title}
                </h3>
                <p className="mt-1 text-zinc-600 dark:text-zinc-400">
                  {project.description}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {project.tech.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
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
                    className="text-zinc-600 underline underline-offset-2 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                  >
                    Repo
                  </a>
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-600 underline underline-offset-2 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                  >
                    Demo
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      <motion.section
        id="timeline"
        variants={VARIANTS_SECTION}
        transition={TRANSITION_SECTION}
      >
        <h2 className="mb-5 text-lg font-medium">Timeline</h2>
        <div className="flex flex-col space-y-2">
          {TIMELINE.map((entry) => (
            <div
              className="relative overflow-hidden rounded-2xl bg-zinc-300/30 p-[1px] dark:bg-zinc-600/30"
              key={entry.id}
            >
              <Spotlight
                className="from-zinc-900 via-zinc-800 to-zinc-700 blur-2xl dark:from-zinc-100 dark:via-zinc-200 dark:to-zinc-50"
                size={64}
              />
              <div className="relative h-full w-full rounded-[15px] bg-white p-4 dark:bg-zinc-950">
                <div className="relative flex w-full flex-row justify-between">
                  <div>
                    <h3 className="font-normal dark:text-zinc-100">
                      {entry.title}
                    </h3>
                    <p className="text-zinc-500 dark:text-zinc-400">
                      {entry.description}
                    </p>
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-400">
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
        variants={VARIANTS_SECTION}
        transition={TRANSITION_SECTION}
      >
        <h2 className="mb-5 text-lg font-medium">Contact</h2>
        <ContactForm />
      </motion.section>

      {BLOG_ENABLED && (
        <motion.section
          id="blog"
          variants={VARIANTS_SECTION}
          transition={TRANSITION_SECTION}
        >
          <h2 className="mb-3 text-lg font-medium">Blog</h2>
          <div className="flex flex-col space-y-0">
            <AnimatedBackground
              enableHover
              className="h-full w-full rounded-lg bg-zinc-100 dark:bg-zinc-900/80"
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
                    <h3 className="font-normal dark:text-zinc-100">
                      {post.title}
                    </h3>
                    <p className="text-zinc-500 dark:text-zinc-400">
                      {post.description}
                    </p>
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
